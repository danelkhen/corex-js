using SharpKit.Html;
using SharpKit.JavaScript;

namespace tidytree
{
    /// <summary>
    /// An algorithm implementation of Reingold–Tilford Tree - aka Tidy Tree
    /// </summary>
    [JsType(JsMode.Prototype)]
    class TreeLayout
    {

        public TreeLayout()
        {
            Nodes = new JsDictionary<TreeNode, TreeLayoutNode>();
        }

        TreeLayoutNode Tree2;
        JsDictionary<TreeNode, TreeLayoutNode> Nodes;
        public JsNumber Distance { get; set; }
        public TreeNode Tree { get; set; }

        TreeLayoutNode ToTreeLayoutNode(TreeNode node)
        {
            var node2 = new TreeLayoutNode { Source = node, Mod = 0, Prelim = 0, Shift = 0, Number = 0, Change = 0, X = 0, Y = 0 };
            node2.Ancestor = node2;
            node2.Children = node.Children.select(ToTreeLayoutNode);
            node2.Children.forEach(t => t.Parent = node2);
            Nodes.Add(node, node2);
            return node2;
        }

        TreeLayoutNode GetNode(TreeNode node)
        {
            return Nodes[node];
        }


        public void PerformLayout()
        {
            if (Distance == null)
                Distance = 10;
            Nodes.Clear();
            Tree2 = ToTreeLayoutNode(Tree);
            var treeNodes = Tree2.IterateNodesBreadth();
            var parents = treeNodes.where(x => x.Children.length > 0);
            // assign a number to each node, representing its position among its siblings (parent.IndexOfSubtree)
            foreach (var treeNode in parents)
            {
                for (int i = 0; i != treeNode.Children.length; ++i)
                {
                    treeNode.GetChild(i).Number = i;
                }
            }
            var r = Nodes[Tree];
            FirstWalk(r);
            SecondWalk(r, -r.Prelim);
            NormalizeCoordinates();
        }

        /// <summary>
        /// Returns a hashmap of coordinates for each node
        /// </summary>
        /// <returns></returns>
        public JsDictionary<TreeNode, Point> GetNodeCoordinates()
        {
            var dict = new JsDictionary<TreeNode, Point>();
            if (Nodes == null || Nodes.Count == 0)
                return dict;
            foreach (var node in Nodes.Values)
            {
                var p = new Point { X = node.X, Y = node.Y };
                dict.Add(node.Source, p);
            }
            return dict;
        }

        /// <summary>
        /// Returns the bounding box for this layout. When the layout is normalized, the rectangle should be [0,0,xmin,xmax].
        /// </summary>
        /// <returns></returns>
        public Rectangle GetBounds()
        {
            float xmin, xmax, ymin, ymax; xmin = xmax = ymin = ymax = 0;
            var list = Nodes.Values.toArray();
            for (int i = 0; i != list.length; ++i)
            {
                float x = list[i].X, y = list[i].Y;
                if (xmin > x) xmin = x;
                if (xmax < x) xmax = x;
                if (ymin > y) ymin = y;
                if (ymax < y) ymax = y;
            }
            return new Rectangle { X = xmin, Y = ymin, Width = xmax + Distance, Height = ymax + Distance };
        }

        /// <summary>
        /// Transform node coordinates so that all coordinates are positive and start from 0.
        /// </summary>
        void NormalizeCoordinates()
        {
            var list = Nodes.Values.toArray();
            float xmin = 0, ymin = 0;
            for (int i = 0; i != list.length; ++i)
            {
                if (xmin > list[i].X)
                    xmin = list[i].X;
                if (ymin > list[i].Y)
                    ymin = list[i].Y;
            }
            for (int i = 0; i != list.length; ++i)
            {
                list[i].X -= xmin;
                list[i].Y -= ymin;
            }
        }

        void FirstWalk(TreeLayoutNode v)
        {
            TreeLayoutNode w;
            if (v.IsLeaf())
            {
                w = LeftSibling(v);
                if (w != null)
                    v.Prelim = w.Prelim + Distance;
                return;
            }
            var node = v;
            var defaultAncestor = node.GetChild(0); // let defaultAncestor be the leftmost child of v
            for (int i = 0; i != node.Children.length; ++i)
            {
                var s = node.GetChild(i);
                w = s;
                FirstWalk(w);
                defaultAncestor = Apportion(w, defaultAncestor);
            }
            ExecuteShifts(v);
            int c = node.Children.length;
            var leftmost = node.GetChild(0);
            var rightmost = node.GetChild(c - 1);
            float midPoint = (leftmost.Prelim + rightmost.Prelim) / 2;
            w = LeftSibling(v);
            if (w != null)
            {
                v.Prelim = w.Prelim + Distance;
                v.Mod = v.Prelim - midPoint;
            }
            else
            {
                v.Prelim = midPoint;
            }
        }

        void SecondWalk(TreeLayoutNode v, float m)
        {
            v.X = v.Prelim + m;
            v.Y = Tree2.GetBranchLevel(v) * Distance;
            var symbExprNode = v.Source;
            foreach (var s in symbExprNode.Children)
            {
                SecondWalk(Nodes[s], m + v.Mod);
            }
        }

        TreeLayoutNode Apportion(TreeLayoutNode v, TreeLayoutNode defaultAncestor)
        {
            var w = LeftSibling(v);
            if (w == null)
                return defaultAncestor;
            var vip = v;
            var vop = v;
            var vim = w;
            var vom = LeftmostSibling(vip);

            float sip = vip.Mod;
            float sop = vop.Mod;
            float sim = vim.Mod;
            float som = vom.Mod;

            while (NextRight(vim) != null && NextLeft(vip) != null)
            {
                vim = NextRight(vim);
                vip = NextLeft(vip);
                vom = NextLeft(vom);
                vop = NextRight(vop);
                vop.Ancestor = v;
                float shift = (vim.Prelim + sim) - (vip.Prelim + sip) + Distance;
                if (shift > 0)
                {
                    var ancestor = Ancestor(vim, v) ?? defaultAncestor;
                    MoveSubtree(ancestor, v, shift);
                    sip += shift;
                    sop += shift;
                }
                sim += vim.Mod;
                sip += vip.Mod;
                som += vom.Mod;
                sop += vop.Mod;
            }
            if (NextRight(vim) != null && NextRight(vop) == null)
            {
                vop.Thread = NextRight(vim);
                vop.Mod += (sim - sop);
            }
            if (NextLeft(vip) != null && NextLeft(vom) == null)
            {
                vom.Thread = NextLeft(vip);
                vom.Mod += (sip - som);
                defaultAncestor = v;
            }
            return defaultAncestor;
        }

        void MoveSubtree(TreeLayoutNode wm, TreeLayoutNode wp, float shift)
        {
            int subtrees = wp.Number - wm.Number;
            wp.Change -= shift / subtrees;
            wp.Shift += shift;
            wm.Change += shift / subtrees;
            wp.Prelim += shift;
            wp.Mod += shift;
        }

        void ExecuteShifts(TreeLayoutNode v)
        {
            if (v.IsLeaf())
                return;
            float shift = 0;
            float change = 0;
            for (int i = v.Children.length - 1; i >= 0; --i)
            {
                var w = v.GetChild(i);
                w.Prelim += shift;
                w.Mod += shift;
                change += w.Change;
                shift += (w.Shift + change);
            }
        }

        #region Helper functions
        TreeLayoutNode Ancestor(TreeLayoutNode vi, TreeLayoutNode v)
        {
            var ancestor = vi.Ancestor;
            return ancestor.Parent == v.Parent ? ancestor : null;
        }

        TreeLayoutNode NextLeft(TreeLayoutNode v)
        {
            int c = v.Children.length;
            return c == 0 ? v.Thread : v.GetChild(0); // return leftmost child
        }

        TreeLayoutNode NextRight(TreeLayoutNode v)
        {
            int c = v.Children.length;
            return c == 0 ? v.Thread : v.GetChild(c - 1); // return rightmost child
        }

        TreeLayoutNode LeftSibling(TreeLayoutNode n)
        {
            var parent = n.Parent;
            if (parent == null)
                return null;
            int i = parent.Children.indexOf(n);
            if (i == 0)
                return null;
            return parent.GetChild(i - 1);
        }

        TreeLayoutNode LeftmostSibling(TreeLayoutNode n)
        {
            var parent = n.Parent;
            if (parent == null)
                return null;
            int i = parent.Children.indexOf(n);
            if (i == 0)
                return null;
            return parent.GetChild(0);
        }
        #endregion
    }


    [JsType(JsMode.Json)]
    class TreeLayoutNode
    {
        public TreeLayoutNode Thread;
        public TreeLayoutNode Ancestor;
        public JsNumber Mod;
        public JsNumber Prelim;
        public JsNumber Change;
        public JsNumber Shift;
        public JsNumber Number;
        public JsNumber X;
        public JsNumber Y;
        public TreeNode Source;

        public JsArray<TreeLayoutNode> Children { get; set; }
        public TreeLayoutNode Parent { get; set; }
    }

}