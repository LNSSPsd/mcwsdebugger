module.exports={
	help:{
		cn:{
			removeedunpc:{"body":{"command":"§eremoveedunpc:","description":"§e%commands.removeedunpc.description","statusCode":0,"statusMessage":"§eremoveedunpc:\n§e删除地图内所有NPC\n使用：\n- /removeedunpc","usage":"- /removeedunpc"},"header":{"messagePurpose":"commandResponse","requestId":"00000000-0001-1000-ffff-000000000000","version":1}},
			enableedunpc:{"body":{"command":"§eenableedunpc:","description":"§e%commands.enableedunpc.description","statusCode":0,"statusMessage":"§eenableedunpc:\n§e是否允许在地图内生成NPC: true允许, false禁止\n使用：\n- /enableedunpc <true|false>","usage":"- /enableedunpc <true|false>"},"header":{"messagePurpose":"commandResponse","requestId":"00000000-0001-1000-ffff-000000000000","version":1}},
		},bd:{},
		notfound:{"body":{"statusCode":-2147483648,"statusMessage":"语法错误：意外的“$cmdname$”：出现在“help >>$cmdname$<<”"},"header":{"messagePurpose":"commandResponse","requestId":"00000000-0001-1000-ffff-000000000000","version":1}}
	}
};
