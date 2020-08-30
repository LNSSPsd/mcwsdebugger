function ToBdumpV2(json){
	let loaded=[];
	let dsize=0;
	let pointer=0;
	for(let i of json.data){
		if(loaded.indexOf(i[1])==-1){
			loaded.push(i[1]);
			dsize+=(i[1].length+1);
		}
	}

	let bufbdp=Buffer.alloc(6+2+json.author.length+1+dsize+1+2+(json.size*8)+4);
	function writebuf(val,typ){
		if(typ==1){
			bufbdp[pointer]=val;
			pointer++;
		}else if(typ==2){
			bufbdp.writeInt16BE(val,pointer);
			pointer+=2;
		}else{
			bufbdp.write(val,pointer);
			pointer+=val.length;
		}
	}
	writebuf("BDMPS\0");
	writebuf(2,1);
	writebuf(0,1);
	writebuf(json.author);
	writebuf(0,1);
	for(let i of loaded){writebuf(i+"\0");}
	writebuf("\0BL");
	for(let i of json.data){
		writebuf(i[0][0],2);
		writebuf(i[0][1],2);
		writebuf(i[0][2],2);
		writebuf(loaded.indexOf(i[1]),1);
		writebuf(i[2],1);
	}
	writebuf("DEND");
	return bufbdp;
}


function colorify(astr){
	let str="";
	let cing=false;
	for(let i=0;i<astr.length;i++){
		if(astr.charAt(i)!="§"&&!cing){
			str+=astr.charAt(i);
			continue;
		}

		if(cing){
			switch(astr.charAt(i)){
				case "r":
					str+="\x1b[0m";
					break;
				case "0":
					str+="\x1b[90m";
					break;
				case "1":
					str+="\x1b[34m";break;
				case "2":
					str+="\x1b[32m";break;
				case "3":
					str+="\x1b[36m";break;
				case "4":
					str+="\x1b[31m";break;
				case "5":
					str+="\x1b[35m";break;
				case "6":
					str+="\x1b[33m";break;
				case "7":
					str+="\x1b[37m";break;
				case "8":
					str+="\x1b[90m";break;
				case "9":
					str+="\x1b[94m";break;
				case "a":
					str+="\x1b[92m";break;
				case "b":
					str+="\x1b[96m";break;
				case "c":
					str+="\x1b[91m";break;
				case "d":
					str+="\x1b[95m";break;
				case "e":
					str+="\x1b[93m";break;
				case "f":
					str+="\x1b[97m";break;
				case "k":
					str+="\x1b[7m";break;
				case "l":
					str+="\x1b[1m";break;
				case "o":
					str+="\x1b[3m";break;
				case "n":
					str+="\x1b[4m";break;
				case "m":
					str+="\x1b[9m";break;
				case "\"":
					break;
				case "'":
					break;
				default:
					str+="["+astr.charAt(i)+"]";
			}
			cing=false;
			continue;
		}

		if(astr.charAt(i)=="§"){
			cing=true;
			continue;
		}

	}
	return str+"\x1b[0m";
}
function colorifyk(astr){
	let str="";
	let cing=false;
	for(let i=0;i<astr.length;i++){
		if(astr.charAt(i)!="`"&&!cing){
			str+=astr.charAt(i);
			continue;
		}

		if(cing){
			switch(astr.charAt(i)){
				case "r":
					str+="\x1b[0m";
					break;
				case "0":
					str+="\x1b[90m";
					break;
				case "1":
					str+="\x1b[34m";break;
				case "2":
					str+="\x1b[32m";break;
				case "3":
					str+="\x1b[36m";break;
				case "4":
					str+="\x1b[31m";break;
				case "5":
					str+="\x1b[35m";break;
				case "6":
					str+="\x1b[33m";break;
				case "7":
					str+="\x1b[37m";break;
				case "8":
					str+="\x1b[90m";break;
				case "9":
					str+="\x1b[94m";break;
				case "a":
					str+="\x1b[92m";break;
				case "b":
					str+="\x1b[96m";break;
				case "c":
					str+="\x1b[91m";break;
				case "d":
					str+="\x1b[95m";break;
				case "e":
					str+="\x1b[93m";break;
				case "f":
					str+="\x1b[97m";break;
				case "k":
					str+="\x1b[7m";break;
				case "l":
					str+="\x1b[1m";break;
				case "o":
					str+="\x1b[3m";break;
				case "n":
					str+="\x1b[4m";break;
				case "m":
					str+="\x1b[9m";break;
				case "\"":
					break;
				case "'":
					break;
				default:
					str+="["+astr.charAt(i)+"]";
			}
			cing=false;
			continue;
		}

		if(astr.charAt(i)=="`"){
			cing=true;
			continue;
		}

	}
	return str+"\x1b[0m";
}

module.exports={ToBdumpV2:ToBdumpV2,colorify:colorify,colorifyk:colorifyk};
