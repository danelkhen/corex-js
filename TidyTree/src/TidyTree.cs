using CorexJs;
using SharpKit.JavaScript;

namespace tidytree
{
    [JsType(JsMode.Prototype)]
    public class TidyTree
    {
        public Rectangle layout(TreeNode node, JsNumber distance = null)
        {
            node.Verify();
            var layout = new TreeLayout
            {
                Distance = distance,
                Tree = node,
            };
            layout.PerformLayout();
            Map = layout.GetNodeCoordinates();
            update(node);
            return layout.GetBounds();
        }
        JsDictionary<TreeNode, Point> Map;

        void update(TreeNode node2)
        {
            node2.Position = Map[node2];
            if (node2.Children != null)
                node2.Children.forEach(update);
        }
    }
}
