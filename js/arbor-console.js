
ArborJS.console = {};
ArborJS.console.signature = 
[
	'    _,                     ___   __,	.---.           _....._',
 	'   / |       /            ( /   (     /  p  `\\     .-""`:     :`"-.',
 	'  /--|  _   /   __ _       /     `.   |__   - |  ,\'     .     \'    \',',
 	'_/   |_/ (_/_) (_)/ (_o  _/_   (___)   ._>    \\ /:      :     ;      :,',
 	'                        //          	 \'-.    \'\\`.     .     :     \'  \\',
 	'                       (/           	    `.   | .\'._.\' \'._.\' \'._.\'.  |',
 	'										  	`;-\\.   :     :     \'   \'/,__,',
	'											  .-\'`\'._ \'     .     : _.\'.__.\'',
	'   										 ((((-\'/ `";--..:..--;"` \\',
	'   											 .\'   /           \\   \\',
	'    										    ((((-\'           ((((-\''
];

ArborJS.console.helptext =
[
	'\n[[b;#66e066;#383c3c]ArborJS] is a super-small JavaScript library for visualizing L-systems.',
	'\to----- It uses WebGL for vibrant colors and three glorious dimensions.',
	'\to----- Pseudo-terminal provided by jcubic\'s [[i;#f1f2f2;#383c3c]jquery-terminal].',
	'\to----- To get started making your own L-tree, enter [[b;#ff6666;#383c3c]new].',
	'\to----- To display this text again, type [[b;#ff6666;#383c3c]help] at any time.\n'	
].join('\n');



ArborJS.console.interpreter = 
{
	help: function()
	{
		this.echo(ArborJS.console.helptext);
	},
	new: function(a)
	{
		var name = a || "mytree";
		trees[name] = new ArborJS.Tree();

		// Tween old tree off-camera and serialize.
		tweenpos = new THREE.Vector3(0, 0, 0);
		tweentar = (function()
		{
			var camright = new THREE.Vector3(1, 0, 0);
	        camright.applyMatrix4(camera.matrixWorld);
	        camright.sub(camera.position);
	        camright.multiplyScalar(camera.position.distanceTo(tweenpos));
	        console.log(camright);
	        return camright;
		})();
		console.log(tweentar);
        tween = new TWEEN.Tween(tweenpos).to(tweentar, 1000);

		tween.onUpdate(function()
		{
			curtree.position.x = tweenpos.x;
			curtree.position.y = tweenpos.y;
			curtree.position.z = tweenpos.z;
		})
		.onComplete(function()
		{
			curtree = trees[name];
		});
		tween.start();

		// Create new tree for the user.

	}
};
