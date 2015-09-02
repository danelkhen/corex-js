using SharpKit.JavaScript;

namespace tidytree
{

    [JsType(JsMode.Json)]
    public class TreeNode
    {
        public TreeNode Parent { get; set; }
        public virtual JsArray<TreeNode> Children { get; set; }
        public Point Position { get; set; }
    }


    [JsType(JsMode.Prototype)]
    public static class TreeNodeExtensions
    {
        /// <summary>
        /// Verifies children array is not null, and parent is set properly
        /// </summary>
        /// <param name="node"></param>
        public static void Verify(this TreeNode node)
        {
            if (node.Children == null)
                node.Children = new JsArray<TreeNode>();
            node.Children.forEach(t => {
                t.Parent = node;
                t.Verify();
            });
        }

    }

    [JsType(JsMode.Prototype)]
    static class LayoutTreeNodeExtensions
    {
        public static int GetBranchLevel(this TreeLayoutNode root, TreeLayoutNode point)
        {
            if (root == point)
                return 0;
            foreach (var subtree in root.Children)
            {
                int branchLevel = GetBranchLevel(subtree, point);
                if (branchLevel < int.MaxValue)
                    return 1 + branchLevel;
            }
            return JsNumber.MAX_VALUE;// int.MaxValue;
        }

        public static bool IsLeaf(this TreeLayoutNode node)
        {
            return node.Source.Children.length == 0;
        }
        public static TreeLayoutNode GetChild(this TreeLayoutNode node, int index)
        {
            return node.Children[index];
        }
        public static JsArray<TreeLayoutNode> IterateNodesBreadth(this TreeLayoutNode self)
        {
            var list = new JsArray<TreeLayoutNode>() { self }; //GetLength()
            int i = 0;
            while (i != list.length)
            {
                for (int j = 0; j != list[i].Children.length; ++j)
                    list.Add(list[i].GetChild(j));
                ++i;
            }
            return list;
        }

    }



}
