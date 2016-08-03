/* jslint node: true, esnext: true */
"use strict";

const a = ["1","2","3"];

console.log(JSON.stringify(a));

const b = a.map((val)=>{
	return 'get_'+val;
});

console.log(JSON.stringify(b));
