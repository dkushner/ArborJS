var ArborJS = ArborJS || { VERSION: 0.1 };

function clone(obj)
{
    var c = obj.constructor();
    for(var key in obj)
        c[key] = obj[key];
    return c;
}

function mergeInto(a, b)
{
    for(var key in a)
        b[key] = a[key];

    return b;
}

ArborJS.Tree = function()
{
    THREE.Object3D.call(this);

    this.scale = new THREE.Vector3(2.0, 2.0, 2.0);
    this.line = new THREE.Geometry();
    this.line.vertices.push(new THREE.Vector3(0, 0, 0));

    this.material = new THREE.LineBasicMaterial
    ({
        color: 0xffffff,
        opacity: 1,
        linewidth: 3,
        vertexColors: THREE.VertexColors
    });

    this.turtle = new THREE.Object3D();
    this.add(this.turtle);

    this.maxIterations = 6;
    this.stateStack = [];

    // L-System Context
    this.locals =
    {
        color: new THREE.Color().setRGB(1, 1, 1)
    };
    // L-System Grammar
    this.grammar =
    {
        '[': function()
        {
            this.stateStack.push
            ({
                position: this.turtle.position.clone(),
                rotation: this.turtle.rotation.clone(),
                locals: clone(this.locals)
            });
        },
        ']': function()
        {
            var restore = this.stateStack.pop();
            this.turtle.position = restore.position;
            this.turtle.rotation = restore.rotation;
            this.locals = restore.locals;
        },
        '+': function(theta)
        {
            this.turtle.matrix.rotateY(theta);
        },
        '-': function(theta)
        {
            this.turtle.matrix.rotateY(-theta);
        },
        '^': function(theta)
        {
            this.turtle.matrix.rotateX(theta);
        },
        'v': function(theta)
        {
            this.turtle.matrix.rotateX(-theta);
        },
        '<': function(theta)
        {
            this.turtle.matrix.rotateZ(theta);
        },
        '>': function(theta)
        {
            this.turtle.matrix.rotateZ(-theta);
        },
        'F': function(dist)
        {
            this.turtle.translateZ(dist);
            this.line.vertices.push(this.turtle.position.clone());
            this.line.colors.push(this.locals.color.clone());
        },
        '!': function(lvar, val)
        {

        },
        '`': function(r, g, b)
        {
            this.locals.color = new THREE.Color().setRGB(r, g, b);
        }
    };
}

ArborJS.Tree.prototype = Object.create(THREE.Object3D.prototype);
ArborJS.Tree.prototype.generate = function(a)
{
    var system = String(a);

    var depth = 0;
    var parse = function(ex, gr, lo, md)
    {
        var oplist = [];
        var expr = String(ex);

        for(var i = 0; i < expr.length; i++)
        {
            var symbol = gr[expr[i]];
            if(!!(symbol && symbol.constructor && symbol.call && symbol.apply))
            {
                var op = { func: symbol, params: []};
                if(expr[i + 1] == '(')
                {
                    var pblock = expr.substring(i + 2, expr.indexOf(')', i + 2));
                    op.params = pblock.split(',').map(function(i)
                    {
                        var check = parseFloat(i) || i;
                        if(typeof(check) === "string")
                            check = lo[i] | i;

                        return check;
                    });
                    i = expr.indexOf(')', i + 2);
                }
                oplist.push(op);
            }
            else if(typeof(symbol) === "object")
            {
                if(depth < md)
                {
                    depth = depth + 1;

                    var lastLocals = clone(lo);
                    lo = mergeInto(symbol.arguments, lo);

                    var overrides = [];
                    if(expr[i + 1] == '(')
                    {
                        var pblock = expr.substring(i + 2, expr.indexOf(')', i + 2));
                        overrides = pblock.split(',').map(function(i)
                        {
                            var check = parseFloat(i) || i;
                            if(typeof(check) === "string")
                                check = lo[i] || i;

                            return check;
                        });
                        i = expr.indexOf(')', i + 2);
                    }

                    var argn = 0;
                    for(var arg in symbol.arguments)
                    {
                        lo[arg] = overrides[argn];
                        argn++;
                    }

                    oplist = oplist.concat(parse(symbol.expression, gr, lo, md));
                    lo = lastLocals;
                    depth = depth - 1;
                }
            }
        }
        return oplist;
    }

    var prog = parse(system, this.grammar, this.locals, this.maxIterations);
    for(var i = 0; i < prog.length; i++)
    {
        prog[i].func.apply(this, prog[i].params);
        //console.log("Applied" + prog[i].func + prog[i].params);
    }

    this.add(new THREE.Line(this.line, this.material, THREE.LineStrip));
}
