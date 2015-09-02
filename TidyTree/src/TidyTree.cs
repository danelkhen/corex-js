using SharpKit.JavaScript;

namespace tidytree
{
    [JsType(JsMode.Prototype)]
    class TidyTree
    {
        public void layout(TreeNode node, JsNumber distance = null)
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
