/* Generated by SharpKit 5 v5.4.9 */
"use strict";
if (typeof ($CreateAnonymousDelegate) == 'undefined') {
    var $CreateAnonymousDelegate = function (target, func) {
        if (target == null || func == null)
            return func;
        var delegate = function () {
            return func.apply(target, arguments);
        };
        delegate.func = func;
        delegate.target = target;
        delegate.isDelegate = true;
        return delegate;
    }
}

if (typeof($CreateDelegate)=='undefined'){
    if(typeof($iKey)=='undefined') var $iKey = 0;
    if(typeof($pKey)=='undefined') var $pKey = String.fromCharCode(1);
    var $CreateDelegate = function(target, func){
        if (target == null || func == null) 
            return func;
        if(func.target==target && func.func==func)
            return func;
        if (target.$delegateCache == null)
            target.$delegateCache = {};
        if (func.$key == null)
            func.$key = $pKey + String(++$iKey);
        var delegate;
        if(target.$delegateCache!=null)
            delegate = target.$delegateCache[func.$key];
        if (delegate == null){
            delegate = function(){
                return func.apply(target, arguments);
            };
            delegate.func = func;
            delegate.target = target;
            delegate.isDelegate = true;
            if(target.$delegateCache!=null)
                target.$delegateCache[func.$key] = delegate;
        }
        return delegate;
    }
}


if (typeof(tidytree) == "undefined")
    var tidytree = {};
tidytree.Extensions = function (){
};
tidytree.Extensions._hashKeyPrefix = "hashkey\0";
tidytree.Extensions._hashKeyIndex = 0;
tidytree.Extensions.Aggregate = function (source, seed, func){
    var tAccumulate = seed;
    for (var $i2 = 0,$l2 = source.length,current = source[$i2]; $i2 < $l2; $i2++, current = source[$i2]){
        tAccumulate = func(tAccumulate, current);
    }
    return tAccumulate;
};
tidytree.TidyTree = function (){
    this.Map = null;
};
tidytree.TidyTree.prototype.layout = function (node, distance){
    tidytree.TreeNodeExtensions.Verify(node);
    var layout = (function (){
        var $v1 = new tidytree.TreeLayout();
        $v1.Distance = distance;
        $v1.Tree = node;
        return $v1;
    }).call(this);
    layout.PerformLayout();
    this.Map = layout.GetNodeCoordinates();
    this.update(node);
    return layout.GetBounds();
};
tidytree.TidyTree.prototype.update = function (node2){
    node2.Position = this.Map.get(node2);
    if (node2.Children != null)
        node2.Children.forEach($CreateDelegate(this, this.update));
};
tidytree.TreeLayout = function (){
    this.Tree2 = null;
    this.Nodes = null;
    this.Distance = null;
    this.Tree = null;
    this.Nodes = new Dictionary();
};
tidytree.TreeLayout.prototype.ToTreeLayoutNode = function (node){
    var node2 = {
        Source: node,
        Mod: 0,
        Prelim: 0,
        Shift: 0,
        Number: 0,
        Change: 0,
        X: 0,
        Y: 0
    };
    node2.Ancestor = node2;
    node2.Children = node.Children.select($CreateDelegate(this, this.ToTreeLayoutNode));
    node2.Children.forEach($CreateAnonymousDelegate(this, function (t){
        t.Parent = node2;
    }));
    this.Nodes.add(node, node2);
    return node2;
};
tidytree.TreeLayout.prototype.GetNode = function (node){
    return this.Nodes.get(node);
};
tidytree.TreeLayout.prototype.PerformLayout = function (){
    if (this.Distance == null)
        this.Distance = 10;
    this.Nodes.clear();
    this.Tree2 = this.ToTreeLayoutNode(this.Tree);
    var treeNodes = tidytree.LayoutTreeNodeExtensions.IterateNodesBreadth(this.Tree2);
    var parents = treeNodes.where($CreateAnonymousDelegate(this, function (x){
        return x.Children.length > 0;
    }));
    for (var $i3 = 0,$l3 = parents.length,treeNode = parents[$i3]; $i3 < $l3; $i3++, treeNode = parents[$i3]){
        for (var i = 0; i != treeNode.Children.length; ++i){
            tidytree.LayoutTreeNodeExtensions.GetChild(treeNode, i).Number = i;
        }
    }
    var r = this.Nodes.get(this.Tree);
    this.FirstWalk(r);
    this.SecondWalk(r, -r.Prelim);
    this.NormalizeCoordinates();
};
tidytree.TreeLayout.prototype.GetNodeCoordinates = function (){
    var dict = new Dictionary();
    if (this.Nodes == null || this.Nodes.count == 0)
        return dict;
    for (var $i4 = 0,$t4 = this.Nodes.values(),$l4 = $t4.length,node = $t4[$i4]; $i4 < $l4; $i4++, node = $t4[$i4]){
        var p = {
            X: node.X,
            Y: node.Y
        };
        dict.add(node.Source, p);
    }
    return dict;
};
tidytree.TreeLayout.prototype.GetBounds = function (){
    var xmin,xmax,ymin,ymax;
    xmin = xmax = ymin = ymax = 0;
    var list = this.Nodes.values().toArray();
    for (var i = 0; i != list.length; ++i){
        var x = list[i].X,y = list[i].Y;
        if (xmin > x)
            xmin = x;
        if (xmax < x)
            xmax = x;
        if (ymin > y)
            ymin = y;
        if (ymax < y)
            ymax = y;
    }
    return {
        X: xmin,
        Y: ymin,
        Width: xmax + this.Distance,
        Height: ymax + this.Distance
    };
};
tidytree.TreeLayout.prototype.NormalizeCoordinates = function (){
    var list = this.Nodes.values().toArray();
    var xmin = 0,ymin = 0;
    for (var i = 0; i != list.length; ++i){
        if (xmin > list[i].X)
            xmin = list[i].X;
        if (ymin > list[i].Y)
            ymin = list[i].Y;
    }
    for (var i = 0; i != list.length; ++i){
        list[i].X -= xmin;
        list[i].Y -= ymin;
    }
};
tidytree.TreeLayout.prototype.FirstWalk = function (v){
    var w;
    if (tidytree.LayoutTreeNodeExtensions.IsLeaf(v)){
        w = this.LeftSibling(v);
        if (w != null)
            v.Prelim = w.Prelim + this.Distance;
        return;
    }
    var node = v;
    var defaultAncestor = tidytree.LayoutTreeNodeExtensions.GetChild(node, 0);
    for (var i = 0; i != node.Children.length; ++i){
        var s = tidytree.LayoutTreeNodeExtensions.GetChild(node, i);
        w = s;
        this.FirstWalk(w);
        defaultAncestor = this.Apportion(w, defaultAncestor);
    }
    this.ExecuteShifts(v);
    var c = node.Children.length;
    var leftmost = tidytree.LayoutTreeNodeExtensions.GetChild(node, 0);
    var rightmost = tidytree.LayoutTreeNodeExtensions.GetChild(node, c - 1);
    var midPoint = (leftmost.Prelim + rightmost.Prelim) / 2;
    w = this.LeftSibling(v);
    if (w != null){
        v.Prelim = w.Prelim + this.Distance;
        v.Mod = v.Prelim - midPoint;
    }
    else {
        v.Prelim = midPoint;
    }
};
tidytree.TreeLayout.prototype.SecondWalk = function (v, m){
    v.X = v.Prelim + m;
    v.Y = tidytree.LayoutTreeNodeExtensions.GetBranchLevel(this.Tree2, v) * this.Distance;
    var symbExprNode = v.Source;
    for (var $i5 = 0,$t5 = symbExprNode.Children,$l5 = $t5.length,s = $t5[$i5]; $i5 < $l5; $i5++, s = $t5[$i5]){
        this.SecondWalk(this.Nodes.get(s), m + v.Mod);
    }
};
tidytree.TreeLayout.prototype.Apportion = function (v, defaultAncestor){
    var w = this.LeftSibling(v);
    if (w == null)
        return defaultAncestor;
    var vip = v;
    var vop = v;
    var vim = w;
    var vom = this.LeftmostSibling(vip);
    var sip = vip.Mod;
    var sop = vop.Mod;
    var sim = vim.Mod;
    var som = vom.Mod;
    while (this.NextRight(vim) != null && this.NextLeft(vip) != null){
        vim = this.NextRight(vim);
        vip = this.NextLeft(vip);
        vom = this.NextLeft(vom);
        vop = this.NextRight(vop);
        vop.Ancestor = v;
        var shift = (vim.Prelim + sim) - (vip.Prelim + sip) + this.Distance;
        if (shift > 0){
            var ancestor = (this.Ancestor(vim, v) != null ? this.Ancestor(vim, v) : defaultAncestor);
            this.MoveSubtree(ancestor, v, shift);
            sip += shift;
            sop += shift;
        }
        sim += vim.Mod;
        sip += vip.Mod;
        som += vom.Mod;
        sop += vop.Mod;
    }
    if (this.NextRight(vim) != null && this.NextRight(vop) == null){
        vop.Thread = this.NextRight(vim);
        vop.Mod += (sim - sop);
    }
    if (this.NextLeft(vip) != null && this.NextLeft(vom) == null){
        vom.Thread = this.NextLeft(vip);
        vom.Mod += (sip - som);
        defaultAncestor = v;
    }
    return defaultAncestor;
};
tidytree.TreeLayout.prototype.MoveSubtree = function (wm, wp, shift){
    var subtrees = wp.Number - wm.Number;
    wp.Change -= shift / subtrees;
    wp.Shift += shift;
    wm.Change += shift / subtrees;
    wp.Prelim += shift;
    wp.Mod += shift;
};
tidytree.TreeLayout.prototype.ExecuteShifts = function (v){
    if (tidytree.LayoutTreeNodeExtensions.IsLeaf(v))
        return;
    var shift = 0;
    var change = 0;
    for (var i = v.Children.length - 1; i >= 0; --i){
        var w = tidytree.LayoutTreeNodeExtensions.GetChild(v, i);
        w.Prelim += shift;
        w.Mod += shift;
        change += w.Change;
        shift += (w.Shift + change);
    }
};
tidytree.TreeLayout.prototype.Ancestor = function (vi, v){
    var ancestor = vi.Ancestor;
    return ancestor.Parent == v.Parent ? ancestor : null;
};
tidytree.TreeLayout.prototype.NextLeft = function (v){
    var c = v.Children.length;
    return c == 0 ? v.Thread : tidytree.LayoutTreeNodeExtensions.GetChild(v, 0);
};
tidytree.TreeLayout.prototype.NextRight = function (v){
    var c = v.Children.length;
    return c == 0 ? v.Thread : tidytree.LayoutTreeNodeExtensions.GetChild(v, c - 1);
};
tidytree.TreeLayout.prototype.LeftSibling = function (n){
    var parent = n.Parent;
    if (parent == null)
        return null;
    var i = parent.Children.indexOf(n);
    if (i == 0)
        return null;
    return tidytree.LayoutTreeNodeExtensions.GetChild(parent, i - 1);
};
tidytree.TreeLayout.prototype.LeftmostSibling = function (n){
    var parent = n.Parent;
    if (parent == null)
        return null;
    var i = parent.Children.indexOf(n);
    if (i == 0)
        return null;
    return tidytree.LayoutTreeNodeExtensions.GetChild(parent, 0);
};
tidytree.TreeNodeExtensions = function (){
};
tidytree.TreeNodeExtensions.Verify = function (node){
    if (node.Children == null)
        node.Children =  [];
    node.Children.forEach(function (t){
        t.Parent = node;
        tidytree.TreeNodeExtensions.Verify(t);
    });
};
tidytree.LayoutTreeNodeExtensions = function (){
};
tidytree.LayoutTreeNodeExtensions.GetBranchLevel = function (root, point){
    if (root == point)
        return 0;
    for (var $i6 = 0,$t6 = root.Children,$l6 = $t6.length,subtree = $t6[$i6]; $i6 < $l6; $i6++, subtree = $t6[$i6]){
        var branchLevel = tidytree.LayoutTreeNodeExtensions.GetBranchLevel(subtree, point);
        if (branchLevel < 2147483647)
            return 1 + branchLevel;
    }
    return Number.MAX_VALUE;
};
tidytree.LayoutTreeNodeExtensions.IsLeaf = function (node){
    return node.Source.Children.length == 0;
};
tidytree.LayoutTreeNodeExtensions.GetChild = function (node, index){
    return node.Children[index];
};
tidytree.LayoutTreeNodeExtensions.IterateNodesBreadth = function (self){
    var list =  [self];
    var i = 0;
    while (i != list.length){
        for (var j = 0; j != list[i].Children.length; ++j)
            list.push(tidytree.LayoutTreeNodeExtensions.GetChild(list[i], j));
        ++i;
    }
    return list;
};

