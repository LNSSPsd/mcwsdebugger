const readline=require("readline").createInterface({input:process.stdin,output:process.stdout});
let config=require("./config");
const bdump=require("libbdump");
const fs=require("fs");
const utils=require("./utils");
const colorify=(config.removeWSColor||config.removeAllColor)?function(a){return a}:utils.colorify;
const colorifyk=(config.removeTipColor||config.removeAllColor)?function(a){return a}:utils.colorifyk;
const ToBdumpV2=utils.ToBdumpV2;
const profile=require("./profile");
const crypto=require("crypto");
const Ber = require('asn1').Ber;

class MCWSEncryptor {
	constructor(){
		
	}

	getInitCommand(salt){
		this.serverKeyPair=crypto.createECDH("secp384r1");
		this.serverKeyPair.generateKeys();
		this.salt=salt;
		const writer=new Ber.Writer();
		writer.startSequence();
		writer.startSequence();
		writer.writeOID("1.2.840.10045.2.1");
		writer.writeOID("1.3.132.0.34");
		writer.endSequence();
		writer.writeBuffer(Buffer.concat([Buffer.from([0x00]),this.serverKeyPair.getPublicKey()]),Ber.BitString);
		writer.endSequence();
		return writer.buffer.toString("base64");
	}

	finishInit(mcPublickey){
		const reader = new Ber.Reader(Buffer.from(mcPublickey, "base64"));
		reader.readSequence();
		reader.readSequence();
		reader.readOID();
		reader.readOID();
		this.spk=Buffer.from(reader.readString(Ber.BitString, true)).slice(1);
		this.sharedSecret=this.serverKeyPair.computeSecret(this.spk);
		this.secretKey=crypto.createHash("sha256").update(this.salt).update(this.sharedSecret).digest();
		this.cipher=crypto.createCipheriv('aes-256-cfb8', this.secretKey, this.secretKey.slice(0,16));
		this.decipher=crypto.createDecipheriv('aes-256-cfb8', this.secretKey, this.secretKey.slice(0,16));
	}

	encrypt(data){
		return this.cipher.update(data);
	}

	decrypt(data){
		return this.decipher.update(data);
	}
}
if(!config.disableLogo){
console.log("__________________________");
console.log("|     𝓶𝓬𝔀𝓼𝓭𝓮𝓫𝓾𝓰𝓰𝓮𝓻       |");
console.log("--------------------------");
//console.log("|C+o+d+e+n+a+m+e         |");
//console.log("|A-u-t-h-o-r             |");
console.log("|     W-e-l-c-o-m-e !    |");
console.log("--------------------------");
}

if(process.argv[2]!==undefined&&process.argv[2].indexOf("://")==-1)process.argv[2]="ws://"+process.argv[2];
let ws=(process.argv[2]===undefined)?null:new (require("ws"))(process.argv[2]+(config.twoslashes?"//":""),config.wsencrypt_protocol?"com.microsoft.minecraft.wsencrypt":[],config.disableDeflate?{perMessageDeflate:false}:{});

let last=(ws===null)?null:process.argv[2];
if(last!==null)console.log(colorifyk("`e`lConnecting to "+last+"`r"));
let showtitle=false;
let speedtest=false;
let spdata=[];
let savebuild=false;
let bfl=new bdump();
let busy=-1;
let savebuildInterval;
readline.setPrompt("");

if(!profile.help.hasOwnProperty(config.helpprofile)){
	console.log(colorifyk("`l`3[Config check] `cconfig.helpprofile not found at profile.`r"));
	process.exit(2);
}

if(!config.saveHistory){
	if(fs.existsSync(".debugger_history.json")){
		fs.unlinkSync(".debugger_history.json");
	}
}else{
	readline.historySize=100;
	if(fs.existsSync(".debugger_history.json")){
		console.log(colorifyk("`l`3[Debugger] `r`lLoading history...`r"));
		readline.history=JSON.parse(fs.readFileSync(".debugger_history.json"));
		console.log(colorifyk("`l`3[Debugger] `r`lLoaded history: `e"+readline.history.length+"`f.`r"));
	}
	process.on("exit",()=>{
		if(readline.history.length>0){
			console.log(colorifyk("`l`3[Debugger] `r`lSaving history...`r"));
			fs.writeFileSync(".debugger_history.json",JSON.stringify(readline.history));
		}
	});
}

readline.on("SIGINT",()=>{
	console.log("");
	process.exit(0);
});
let doitmode=false;
function onOpen(){
	if(doitmode){
	let backws=ws;
	let bt=setInterval(()=>{
		if(backws.readyState==1)backws.send(JSON.stringify({"body":{"eventName":"PlayerMessage","measurements":null,"properties":{"AccountType":1,"ActiveSessionID":"00000000-0000-0000-0000-000000000000","AppSessionID":"00000000-0000-0000-0000-000000000000","Biome":43,"Build":"1.8.0","BuildPlat":2,"Cheevos":false,"ClientId":"9ef24fcdaafebcd948502deabdead901","CurrentInput":2,"CurrentNumPlayers":1,"DeviceSessionId":"00000000-0000-0000-0000-000000000000","Dim":0,"GlobalMultiplayerCorrelationId":"00000000-0000-0000-0000-000000000000","Message":line,"MessageType":"chat","Mode":0,"MultiplayerCorrelationId":"00000000-0000-0000-0000-000000000000","NetworkType":0,"Plat":config.platForm,"PlayerGameMode":config.gameMode,"Sender":config.username,"Seq":57,"ServerId":"raknet:11310020921574762398","Treatments":"","UserId":"10291240344","WorldSessionId":"00000000-0000-0000-0000-000000000000","locale":"en_CN","vrMode":false}},"header":{"messagePurpose":"event","requestId":"00000000-0000-0000-0000-000000000000","version":1}}));
		else clearInterval(bt);
	},0);
	}
	console.log(colorify("§l§3[Debugger] §2Connection established§r"));
}
if(doitmode){
setInterval(()=>{
	ws=new (require("ws"))(last+(config.twoslashes?"//":""),config.wsencrypt_protocol?"com.microsoft.minecraft.wsencrypt":[],config.disableDeflate?{perMessageDeflate:false}:{});
	ws.on("open",onOpen);
	ws.on("error",onErr);
	ws.on("close",onClose);
	ws.on("message",onMsg);
},0);
}
function onClose(){
	console.log(colorify("§l§3[Debugger] §cConnection closed.§r"));
}

function unavailable_tip(){
	console.log(colorifyk("`3`l[Debugger] `cConnection is no longer available. Please connect to other server.`r"));
}

function SBListener(val){
	if(!val){
		clearInterval(savebuildInterval);
		return;
	}
	let lastbusy=-1;
	savebuildInterval=setInterval(()=>{
		if(busy==-1)return;
		if(busy!=lastbusy){lastbusy=busy;return;}
		busy=-1;
		//const bff=ToBdumpV2(bfl);
		//require("fs").writeFileSync(config.buildSaveTo,bff);
		bfl.exportToV2File(config.buildSaveTo);
		console.log(colorify("§5Structure received successfully.\nSaved to: "+config.buildSaveTo));
		return;
	},600);
}

function onErr(e){
	console.log(colorifyk("`3`l[WebSocket error] `c"+e));
}
if(ws!==null){
	ws.on("error",onErr);
	ws.on("message",onMsg);
	ws.on("close",onClose);
	ws.on("open",onOpen);
}

readline.on("line",(line)=>{
	if(line.charAt(0)=="%"){
		if(line.split(" ")[0]=="%reload"){
			delete require.cache[config.configname];
			config=require("./config");
			console.log(colorifyk("`3`l[Debugger] Reloaded config.`r"));
			return;
		}
		if(line.split(" ")[0]=="%terminate"){
			if(ws!==null&&ws.readyState==1)ws.terminate();
			console.log(colorifyk("`3`l[Debugger] Terminated WebSocket connection.`r"));
			return;
		}
		if(line.split(" ")[0]=="%quit"||line.split(" ")[0]=="%exit"){
			process.exit(0);
		}
		if(line.split(" ")[0]=="%wh"||line.split(" ")[0]=="%wipehistory"){
			console.log(colorifyk("`3`l[Debugger]`f Wiping histories..."));
			if(fs.existsSync(".debugger_history.json"))fs.unlinkSync(".debugger_history.json");
			readline.history=[];
			console.log(colorifyk("`3`l[Debugger]`f Wiped out histories."));
			readline.historyIndex=-1;
			return;
		}
		if(line.split(" ")[0]=="%wf"){
			readline.emit("line","%wh");
			readline.historySize=0;
			return;
		}
		if(line.split(" ")[0]=="%connect"){
			console.log(colorifyk("`e`lConnecting to "+(line.split(" ")[1]||last)+"`r"));
			if(ws!==null&&ws.readyState==1)ws.terminate();
			let isrec=false;
			if(line.split(" ").length==1){
				ws=new (require("ws"))(last+(config.twoslashes?"//":""),config.wsencrypt_protocol?"com.microsoft.minecraft.wsencrypt":[],config.disableDeflate?{perMessageDeflate:false}:{});
				isrec=true;
			}else{
				ws=new (require("ws"))("ws://"+line.split(" ")[1]+(config.twoslashes?"//":""),config.wsencrypt_protocol?"com.microsoft.minecraft.wsencrypt":[],config.disableDeflate?{perMessageDeflate:false}:{});
			}
			ws.on("open",onOpen);
			ws.on("error",onErr);
			ws.on("close",onClose);
			ws.on("message",onMsg);
			if(!isrec)last="ws://"+line.split(" ")[1];
			return;
		}
		if(line.split(" ")[0]=="%rec"){
			console.log(colorifyk("`e`lConnecting to "+last+"`r"));
			if(ws.readyState==1){ws.terminate();}
			ws=new (require("ws"))(last+(config.twoslashes?"//":""),config.wsencrypt_protocol?"com.microsoft.minecraft.wsencrypt":[],config.disableDeflate?{perMessageDeflate:false}:{});
			ws.on("open",onOpen);
			ws.on("close",onClose);
			ws.on("error",onErr);
			ws.on("message",onMsg);
			return;
		}
		if(line.split(" ")[0]=="%send"){
			if(ws.readyState!=1){
				unavailable_tip();
				return;
			}
			let arry=line.split(" ");
			arry.splice(0,1);
			if(ws.sessionencryptor!==undefined){
				ws.send(ws.sessionencryptor.encrypt(arry.join(" ")));
			}else{
				ws.send(arry.join(" "));
			}
			return;
		}
		if(line.split(" ")[0]=="%showtitle"){
			showtitle=!(showtitle);
			console.log("[SET] showtitle:"+showtitle);
			return;
		}
		if(line.split(" ")[0]=="%speedtest"){
			speedtest=!speedtest;
			console.log("[SET] speedtest:"+speedtest);
			return;
		}
		if(line.split(" ")[0]=="%rsp"){
			spdata=[];
			console.log("[SET] reset");
			return;
		}
		if(line.split(" ")[0]=="%savebuild"){
			savebuild=!(savebuild);
			console.log("[SET] savebuild:"+savebuild);
			SBListener(savebuild);
			return;
		}
		console.log(colorifyk("`c`l[Debugger -> LocalCommand] No such command.`r"));
		return;
	}
	if(ws===null||ws.readyState>1){
		unavailable_tip();
		return;
	}else if(ws.readyState<1){
		console.log(colorifyk("`3`l[Debugger] `eConnecting to server,please wait patiently.`r"));
		return;
	}
	//ws.send(JSON.stringify({"body":{"eventName":"PlayerMessage","measurements":null,"properties":{"AccountType":1,"ActiveSessionID":"6929fdf2-584d-477b-9818-ab20de72c782","AppSessionID":"90eb05c3-828d-4973-9ca6-63bbe632696c","Biome":0,"Build":"1.12.0","BuildPlat":8,"BuildTypeID":1,"Cheevos":true,"ClientId":"1d651939e61c4c598e6bb8a4981cc495","CurrentInput":1,"CurrentNumPlayers":1,"DeviceSessionId":"90eb05c3-828d-4973-9ca6-63bbe632696c","Dim":0,"GlobalMultiplayerCorrelationId":"54ccbdd0-8e7a-402b-be02-2c32cc03eb30","Message":line,"MessageType":"chat","Mode":0,"NetworkType":0,"Plat":config.platForm,"PlayerGameMode":config.gameMode,"SchemaCommitHash":"19b6ec0744c3c83a00ecbd840f48cb080c7bc64d","Sender":config.username,"Seq":956,"Treatments":"","WorldFeature":0,"WorldSessionId":"c06974d0-dd3c-47c3-918c-906523cc0e3d","isTrial":0,"locale":"zh_CN","vrMode":false}},"header":{"messagePurpose":"event","requestId":"00000000-0000-0000-0000-000000000000","version":1}}));
	if(ws.sessionencryptor!==undefined){
		ws.send(ws.sessionencryptor.encrypt(JSON.stringify({"body":{"eventName":"PlayerMessage","measurements":null,"properties":{"AccountType":1,"ActiveSessionID":"00000000-0000-0000-0000-000000000000","AppSessionID":"00000000-0000-0000-0000-000000000000","Biome":43,"Build":"1.8.0","BuildPlat":2,"Cheevos":false,"ClientId":"9ef24fcdaafebcd948502deabdead901","CurrentInput":2,"CurrentNumPlayers":1,"DeviceSessionId":"00000000-0000-0000-0000-000000000000","Dim":0,"GlobalMultiplayerCorrelationId":"00000000-0000-0000-0000-000000000000","Message":line,"MessageType":"chat","Mode":0,"MultiplayerCorrelationId":"00000000-0000-0000-0000-000000000000","NetworkType":0,"Plat":config.platForm,"PlayerGameMode":config.gameMode,"Sender":config.username,"Seq":57,"ServerId":"raknet:11310020921574762398","Treatments":"","UserId":"10291240344","WorldSessionId":"00000000-0000-0000-0000-000000000000","locale":"en_CN","vrMode":false}},"header":{"messagePurpose":"event","requestId":"00000000-0000-0000-0000-000000000000","version":1}})));
	}else{
		ws.send(JSON.stringify({"body":{"eventName":"PlayerMessage","measurements":null,"properties":{"AccountType":1,"ActiveSessionID":"00000000-0000-0000-0000-000000000000","AppSessionID":"00000000-0000-0000-0000-000000000000","Biome":43,"Build":"1.8.0","BuildPlat":2,"Cheevos":false,"ClientId":"9ef24fcdaafebcd948502deabdead901","CurrentInput":2,"CurrentNumPlayers":1,"DeviceSessionId":"00000000-0000-0000-0000-000000000000","Dim":0,"GlobalMultiplayerCorrelationId":"00000000-0000-0000-0000-000000000000","Message":line,"MessageType":"chat","Mode":0,"MultiplayerCorrelationId":"00000000-0000-0000-0000-000000000000","NetworkType":0,"Plat":config.platForm,"PlayerGameMode":config.gameMode,"Sender":config.username,"Seq":57,"ServerId":"raknet:11310020921574762398","Treatments":"","UserId":"10291240344","WorldSessionId":"00000000-0000-0000-0000-000000000000","locale":"en_CN","vrMode":false}},"header":{"messagePurpose":"event","requestId":"00000000-0000-0000-0000-000000000000","version":1}}));
	}
});

function onMsg(msg){
	try{
		if(ws.sessionencryptor!==undefined){
			msg=ws.sessionencryptor.decrypt(msg);
		}
		let json=JSON.parse(msg);
		if(config.debug){
			console.log(json);
		}

		if(json.header.messagePurpose=="subscribe"){
			console.log(colorifyk("`l`aSubscribe: `f"+json.body.eventName));
			return;
		}
		if(json.header.messagePurpose=="unsubscribe"){
			console.log(colorifyk("`l`aUnsubscribe: `f"+json.body.eventName));
			return;
		}
		if(json.header.messagePurpose=="commandRequest"){
			//console.log(json);
			let ret={"body":{"statusCode":0,"statusMessage":"Command is OK"},"header":{"messagePurpose":"commandResponse","requestId":json.header.requestId,"version":1}};
			let cmd=json.body.commandLine.split(" ");
			switch(cmd[0]){
				case "enableencryption":
					if(cmd.length<3){
						console.log(colorifyk("`l`3[enableencryption] `cInvalid syntax."));
						ret.body.statusMessage="Invalid syntax";
						ret.body.statusCode=-1;
						break;
					}
					let skey=JSON.parse(cmd[1]);
					let salt=JSON.parse(cmd[2]);
					ws.sessionencryptor=new MCWSEncryptor();
					ret.body.statusMessage=ret.body.publicKey=ws.sessionencryptor.getInitCommand(Buffer.from(salt,"base64"));
					ws.sessionencryptor.finishInit(skey);
					if(config.showKey){
						console.log(colorifyk("`l`e==Data of enableencryption==\n`3WSServer's public key:`f "+ws.sessionencryptor.spk.toString("hex")+"\n\n`3Debugger's public key:`f "+ws.sessionencryptor.serverKeyPair.getPublicKey("hex")+"\n\n`3Debugger's private key:`f "+ws.sessionencryptor.serverKeyPair.getPrivateKey("hex")+"\n`e============================"));
					}
					console.log(colorifyk("`l`3[enableencryption] `fInitialized for this session."));
					console.log(colorifyk("`l`aEnabled encryption"));
					ws.send(JSON.stringify(ret));
					return;
				case "connect":
					console.log(colorifyk("`l`3[Command: connect] `eConnecting to "+cmd[1]+"`r"));
					if(ws.readyState==1)ws.terminate();
					ws=new (require("ws"))("ws://"+cmd[1]+(config.twoslashes?"//":""),config.wsencrypt_protocol?"com.microsoft.minecraft.wsencrypt":[],config.disableDeflate?{perMessageDeflate:false}:{});
					last="ws://"+cmd[1];
					ws.on("open",onOpen);
					ws.on("error",onErr);
					ws.on("close",onClose);
					ws.on("message",onMsg);
					return;
				case "help":
					if(cmd.length>1){
						if(!profile.help[config.helpprofile].hasOwnProperty(cmd[1])){
							ret=profile.help.notfound;
							ret.body.statusMessage=profile.help.notfound.body.statusMessage.replace(/\$cmdname\$/g,cmd[1]);
						}else{
							ret=profile.help[config.helpprofile][cmd[1]];
						}
					}
					ret.header.requestId=json.header.requestId;
					break;
				case "querytarget":
					ret.body.details=JSON.stringify([{dimension:0,position:{"x":config.pos[0],"y":config.pos[1],"z":config.pos[2]},uniqueId:config.uniqueId,yRot:0}]);
					ret.body.statusMessage=""+ret.details;
					break;
				case "say":
					let arr=cmd;
					arr.splice(0,1);
					ret.body.message=arr.join(" ");
					delete ret.body.statusMessage;
					console.log("[External] "+colorify(arr.join(" ")));
					break;
				case "tellraw":
					let arrass=cmd;
					arrass.splice(0,2);
					try{
						let jsons=JSON.parse(arrass.join(" ").replace(/\n/g,"\\n").replace(/\r/g,"").replace(/\x09/g,""));
						for(let i of jsons.rawtext){
							console.log(colorify(i.text));
						}
					}catch(e){
						//fs.writeFileSync("e",e);
						console.log(arrass.join(" ").replace(/\n/g,"\\n").replace(/\r/g,""));
					}
					break;
				case "list":
					ret.body.currentPlayerCount=1;
					ret.body.maxPlayerCount=config.maxPlayerCount;
					ret.body.players=config.username;
					break;
				case "getlocalplayername":
					ret.body.localplayername=config.username;
					break;
				case "testfor":
					ret.body.statusMessage="发现 "+config.username;
					ret.body.victim=[config.username];
					readline.emit("line","L 1324");
					break;
				case "testforblock":
					ret.body.statusMessage="成功找到了位于 "+config.pos.join(",")+" 的方块。";
					ret.body.position={"x":config.pos[0],"y":config.pos[1],"z":config.pos[2]};
					ret.body.matches=true;
					break;
				case "title":
					ret.body.statusMessage="标题命令执行成功";
					if(!showtitle)break;
					let arra=cmd;
					arra.splice(0,3);
					console.log(colorify("\r[TITLE]"+arra.join(" ")));
					break;
				case "setblock":
					if(speedtest){
						if(spdata.length==0){
							spdata[2]=1;
							spdata[0]=(new Date()).getTime();
						}else{
							spdata[2]++;
							spdata[1]=(new Date()).getTime();
							console.log(colorifyk("`l`3[SpeedTest]`f Speed: "+(spdata[2]/((spdata[1]-spdata[0])/1000)).toFixed(4)+" buildablecommands/s"));
						}
					}
					if(!savebuild)break;
					busy++;
					let arrr=json.body.commandLine.split(" ");
					arrr[1]=arrr[1].replace("~","0");
					arrr[2]=arrr[2].replace("~","0");
					arrr[3]=arrr[2].replace("~","0");
					arrr[1]=eval(arrr[1]);
					arrr[2]=eval(arrr[2]);
					arrr[3]=eval(arrr[3]);
					if(arrr[5]==undefined)arrr[5]=0;
					bfl.addBlock([arrr[1],arrr[2],arrr[3]],arrr[4],arrr[5]);
					//bfl.size++;
					//require("fs").writeFileSync("world.json",JSON.stringify(bfl));
					break;
				case "fill":
					ret.body.fillCount=1;
					if(speedtest){
						if(spdata.length==0){
							spdata[2]=1;
							spdata[0]=(new Date()).getTime();
						}else{
							spdata[2]++;
							spdata[1]=(new Date()).getTime();
							console.log(colorifyk("`l`3[SpeedTest]`f Speed: "+(spdata[2]/((spdata[1]-spdata[0])/1000)).toFixed(4)+" buildablecommands/s"));
						}
					}
					if(!savebuild)break;
					let arrrr=json.body.commandLine.split(" ");
					arrrr[1]=arrrr[1].replace("~","0");
					arrrr[2]=arrrr[2].replace("~","0");
					arrrr[3]=arrrr[3].replace("~","0");
					arrrr[1]=eval(arrrr[1]);
					arrrr[2]=eval(arrrr[2]);
					arrrr[3]=eval(arrrr[3]);
					arrrr[4]=arrrr[4].replace("~","0");
					arrrr[5]=arrrr[5].replace("~","0");
					arrrr[6]=arrrr[6].replace("~","0");
					arrrr[4]=eval(arrrr[4]);
					arrrr[5]=eval(arrrr[5]);
					arrrr[6]=eval(arrrr[6]);
					if(arrrr[8]==undefined)arrr[8]=0;
					let hc=[[0,0,0],[0,0,0]];
					if(arrrr[1]>arrrr[4]){
						hc[0][0]=arrrr[1];
						hc[1][0]=arrrr[4];
					}else{
						hc[0][0]=arrrr[4];
						hc[1][0]=arrrr[1];
					}
					if(arrrr[2]>arrrr[5]){
						hc[0][1]=arrrr[2];
						hc[1][1]=arrrr[5];
					}else{
						hc[0][1]=arrrr[5];
						hc[1][1]=arrrr[2];
					}
					if(arrrr[3]>arrrr[6]){
						hc[0][2]=arrrr[3];
						hc[1][2]=arrrr[6];
					}else{
						hc[0][2]=arrrr[6];
						hc[1][2]=arrrr[3];
					}
					for(let i=hc[0][0];i>=hc[1][0];i--){//console.log("i="+i);
						for(let j=hc[0][1];j>=hc[1][1];j--){//console.log("j="+j);
							for(let k=hc[0][2];k>=hc[1][2];k--){//console.log(hc+"|"+[i,j,k]);
								//let bflr;
								//if(bfl==null){try{bfl=JSON.parse(require("fs").readFileSync("world.json"));}catch(e){bfl={format:"FastBuilder",author:"mcwsdebugger",size:0,data:[]}; }}
								bfl.addBlock([i,j,k],arrrr[7],arrrr[8]);
								//bfl.size++;
								//require("fs").writeFileSync("world.json",JSON.stringify(bflr));
							}
						}
					}
					busy++;
					break;
			}
			if(ws.sessionencryptor!==undefined){
				ws.send(ws.sessionencryptor.encrypt(JSON.stringify(ret)));
			}else{
				ws.send(JSON.stringify(ret));
			}
		}
	}catch(e){console.log("Error: %s\nMsg:\n"+msg,e.stack);return;}
}
