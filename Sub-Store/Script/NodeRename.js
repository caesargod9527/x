/*
原链接:https://gitlab.com/lodepuly/vpn_tool/-/raw/main/Resource/Script/Sub-Store/NodeRename.js
版本：48小时缓存版
注意：此脚本仅支持Surge和Loon
符号：🅳电信 🅻联通 🆈移动 🅶广电 🅲公司 🆉直连 🎮游戏
接口：入口查询[ip-api] 落地查询[ip-api]
功能：根据接口返回的真实结果，重新对节点命名。添加入口城市、落地国家或地区、国内运营商信息，并对这些数据做持久化缓存（48小时有效期），减少API请求次数，提高运行效率。
异常：如遇问题，Loon可以进入[配置]→[持久化缓存]→[删除指定数据]→输入Key[sub-store-cached-script-resource][sub-store-nodes][sub-store-proxies]并删除缓存。Surge需要进入[脚本编辑器]→左下角[设置]→[$persistentStore]→[sub-store-cached-script-resource][sub-store-nodes][sub-store-proxies]删除缓存数据。
作者：@Key @奶茶姐 @小一
用法：Sub-Store脚本操作里添加
日期：2023-06-17 00:35:59
示例：https://github.com/Moli-X/Resources/raw/main/Sub-Store/Script/NodeRename.js#timeout=2000&cd=2000&isp&city&game&bl&flag&fgf=➤&tz=[方括号内填写你的机场名]&name=[方括号内填写你的机场名]
箭头: https://symbl.cc/cn/collections/arrow-symbols
----------------
以下是此脚本支持的参数，必须以"#"开头，多个参数使用"&"连接，参考上述地址为例使用参数。
无参数时的节点命名格式: "北京 美国 01"，如果[入口IP或国家]或[落地IP或国家]一样则为 "直连 德国 01" 
[bl]        增加倍率标识；
[isp]       增加运营商或者直连标识；
[dns]       将节点域名解析为IP；
[sheng]     增加入口省份标识；
[city]      增加入口城市标识；
[yun]       增加口云服务商标识；
[game]      增加游戏节点标识；
[flag]      增加旗帜标识，默认无此参数；
[offtz]     关闭脚本通知；
[snone]     清理个别地区只有一个节点的序号；
[fgf=]      设置入口和落地之间的分隔符，默认为空格；
[sn=]       设置国家与序号之间的分隔符，默认为空格；
[name=]     为节点添加机场名称前缀；
[tz=]       为推送通知时添加机场名称；
[timeout=]  测试节点延时允许的最大超时参数，超出允许范围则判定为无效节点，默认1600ms；
[yw]        落地为英文缩写，不建议与其他入口参数配合使用 因为其他参数api没有返回英文
[h=]        节点缓存有效期，单位小时，时间参数只能二选一，Loon用户不需要此参数，请进入Sub-Store插件的配置界面自定义缓存有效期；
[min=]      节点缓存有效期，单位分钟，时间参数只能二选一，Loon用户不需要此参数，请进入Sub-Store插件的配置界面自定义缓存有效期；
[cd=]       当有缓存时，会先读取缓存，且对节点进行延时测试，直接输出结果；
            当无缓存时，会对节点直接进行延时测试，节点延时超过所设定的值则判定为无效节点，默认400ms，并将结果写入缓存；
            当设置[cd=]的值小于50时，则直接读取缓存；
[debug]     调试日志，普通用户不建议使用。
*/
const $=$substore,bl=$arguments["bl"],yw=$arguments["yw"],isp=$arguments["isp"],yun=$arguments["yun"],city=$arguments["city"],flag=$arguments["flag"],game=$arguments["game"],sheng=$arguments["sheng"],offtz=$arguments["offtz"],debug=$arguments["debug"],numone=$arguments["snone"],h=$arguments.h?decodeURI($arguments.h):"",min=$arguments.min?decodeURI($arguments.min):"",tzname=$arguments.tz?decodeURI($arguments.tz):"",keynames=$arguments.name?decodeURI($arguments.name):"";const FGF=$arguments.fgf==undefined?" ":decodeURI($arguments.fgf),XHFGF=$arguments.sn==undefined?" ":decodeURI($arguments.sn),{isLoon:isLoon,isSurge:isSurge}=$substore.env,dns=$arguments["dnsjx"],target=isLoon?"Loon":isSurge?"Surge":undefined;let cd=$arguments["cd"]?$arguments["cd"]:460,timeout=$arguments["timeout"]?$arguments["timeout"]:1520,writet="",innum=1728e5,loontrue=false,onen=false,Sue=false,v4=false,v6=false,noali=false;if(min!==""){Sue=true;innum=parseInt(min,10)*6e4;writet=$persistentStore.write(JSON.stringify(innum),"time-cache")}else if(h!==""){Sue=true;innum=parseInt(h,10)*36e5;writet=$persistentStore.write(JSON.stringify(innum),"time-cache")}else{writet=$persistentStore.write(JSON.stringify(innum),"time-cache")}function getflag(e){const t=e.toUpperCase().split("").map((e=>127397+e.charCodeAt()));return String.fromCodePoint(...t).replace(/🇹🇼/g,"🇨🇳")}function sleep(e){return new Promise((t=>setTimeout(t,e)))}let apiRead=0,apiw=0;const outs=new Map;async function OUTIA(e){const t=getid(e);if(outs.has(t)){return outs.get(t)}const n=scriptResourceCache.get(t);if(n){apiRead++;return n}else{const n=1;const i=new Promise(((s,o)=>{if(cd<51&&onen){return i}else{const i=async r=>{const a=`http://ip-api.com/json?lang=zh-CN&fields=status,message,country,countryCode,city,query`;let u=ProxyUtils.produce([e],target);try{const e=await Promise.race([$.http.get({url:a,node:u,"policy-descriptor":u}),new Promise(((e,t)=>setTimeout((()=>t(new Error("timeout"))),timeout)))]);const n=JSON.parse(e.body);if(n.status==="success"){scriptResourceCache.set(t,n);apiw++;s(n)}else{o(new Error(n.message))}}catch(e){if(r<n){i(r+1)}else{o(e)}}};i(0)}}));outs.set(t,i);return i}}const ali=new Map;async function AliD(e){const t=/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$|^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/.test(e);if(t){return e}else{const t=getaliid(e);if(ali.has(t)){return ali.get(t)}const n=scriptResourceCache.get(t);if(n){return n}else{const n=new Promise(((i,s)=>{if(cd<51&&onen){return n}else{const n=`http://223.5.5.5/resolve?name=${e}&type=A&short=1`;const o=new Promise(((e,t)=>{setTimeout((()=>{t(new Error("timeout"))}),timeout)}));const r=$.http.get({url:n}).then((e=>{const n=JSON.parse(e.body);if(n.length>0){scriptResourceCache.set(t,n[0]);i(n[0])}else{i("keyn")}})).catch((e=>{s(e)}));Promise.race([o,r]).catch((e=>{s(e)}))}}));ali.set(t,n);return n}}}const spapi=new Map;async function SPEC(e,t){const n=getspcn(e);if(spapi.has(n)){return spapi.get(n)}const i=scriptResourceCache.get(n);if(i){return i}else{const e=new Promise(((i,s)=>{if(cd<51&&onen){return e}else{const e=t;const o=`https://api-v3.speedtest.cn/ip?ip=${e}`;const r=new Promise(((e,t)=>{setTimeout((()=>{t(new Error("timeout"))}),timeout)}));const a=$.http.get({url:o}).then((e=>{const t=JSON.parse(e.body);if(t.data){const{country:e,province:s,city:o,isp:r,ip:a}=t.data;const u={country:e,regionName:s,city:o,isp:r,ip:a};i(u);scriptResourceCache.set(n,u)}else{s(new Error)}})).catch((e=>{s(e)}));Promise.race([r,a]).catch((e=>{s(e)}))}}));ins.set(n,e);return e}}const ins=new Map;async function INIA(e){const t=getinid(e);if(ins.has(t)){return ins.get(t)}const n=scriptResourceCache.get(t);if(n){return n}else{const n=new Promise(((i,s)=>{if(cd<51&&onen){return n}else{const n=e;const o=`http://ip-api.com/json/${n}?lang=zh-CN&fields=status,message,country,city,query,regionName`;const r=new Promise(((e,t)=>{setTimeout((()=>{t(new Error("timeout"))}),timeout)}));const a=$.http.get({url:o}).then((e=>{const s=JSON.parse(e.body);if(s.status==="success"){scriptResourceCache.set(t,s);i(s)}else{i(n)}})).catch((e=>{s(e)}));Promise.race([r,a]).catch((e=>{s(e)}))}}));ins.set(t,n);return n}}function removels(e){const t=new Set;const n=[];for(const i of e){if(i.qc&&!t.has(i.qc)){t.add(i.qc);n.push(i)}}return n}function removeqc(e){const t=new Set;const n=[];for(const i of e){if(!t.has(i.qc)){t.add(i.qc);const e={...i};delete e.qc;n.push(e)}}return n}const nlc=/\u9080\u8bf7|\u8fd4\u5229|\u5faa\u73af|\u5b98\u7f51|\u5ba2\u670d|\u7f51\u7ad9|\u7f51\u5740|\u83b7\u53d6|\u8ba2\u9605|\u6d41\u91cf|\u5230\u671f|\u4e0b\u6b21|\u7248\u672c|\u5b98\u5740|\u5907\u7528|\u5230\u671f|\u8fc7\u671f|\u5df2\u7528|\u56fd\u5185|\u56fd\u9645|\u56fd\u5916|\u8054\u7cfb|\u90ae\u7bb1|\u5de5\u5355|\u8d29\u5356|\u5012\u5356|\u9632\u6b62|(\b(USE|USED|TOTAL|EXPIRE|EMAIL)\b)|\d\s?g/i;function jxh(e){const t=e.reduce(((e,t)=>{const n=e.find((e=>e.name===t.name));if(n){n.count++;n.items.push({...t,name:`${t.name}${XHFGF}${n.count.toString().padStart(2,"0")}`})}else{e.push({name:t.name,count:1,items:[{...t,name:`${t.name}${XHFGF}01`}]})}return e}),[]);const n=t.flatMap((e=>e.items));e.splice(0,e.length,...n);return e}function onee(e){const t=e.reduce(((e,t)=>{const n=t.name.replace(/[^A-Za-z0-9\u00C0-\u017F\u4E00-\u9FFF]+\d+$/,"");if(!e[n]){e[n]=[]}e[n].push(t);return e}),{});for(const e in t){if(t[e].length===1&&t[e][0].name.endsWith("01")){const n=t[e][0];n.name=e}}return e}function zhTime(e){e=e.toString().replace(/-/g,"");if(e<1e3){return`${Math.round(e)}毫秒`}else if(e<6e4){return`${Math.round(e/1e3)}秒`}else if(e<36e5){return`${Math.round(e/6e4)}分钟`}else if(e>=36e5){return`${Math.round(e/36e5)}小时`}}const regexArray=[/\u6e38\u620f|game/i];const valueArray=["Game"];async function operator(e){let t=0;const n=new Date;const i=isLoon||isSurge;if(!i){$.error(`No Loon or Surge`);return e}if(typeof scriptResourceCache==="undefined"){console.log("\nNCNAME: 不支持此 SubStore,\n查看脚本说明\nhttps://github.com/Keywos/rule/raw/main/cname.js");if(target=="Surge"){$notification.post("NCNAME Sub-Store未更新","","请点击或查看log查看脚本说明安装对应版本",{url:"https://github.com/Keywos/rule/raw/main/Sub-Store/Sub-Store.sgmodule"})}else if(target=="Loon"){$notification.post("NCNAME Sub-Store未更新","","请点击安装插件, 或查看log安装对应版本, 并关闭原本的substore","loon://import?plugin=https://gitlab.com/lodepuly/vpn_tool/-/raw/main/Tool/Loon/Plugin/Sub-Store.plugin")}return e}var s=$arguments["bs"]?$arguments["bs"]:12;const o=e.length;console.log(`设定api超时: ${zhTime(timeout)}`);console.log(`有缓api超时: ${zhTime(cd)}`);console.log(`批处理节点数: ${s} 个`);console.log(`开始处理节点: ${o} 个`);e=e.filter((e=>!nlc.test(e.name)));let r=0,a="",u="",c=false;do{while(r<e.length&&!c){const t=e.slice(r,r+1);await Promise.all(t.map((async e=>{try{const t=new Map;const n=getid(e);if(t.has(n)){return t.get(n)}const i=scriptResourceCache.get(n);if(i){if(!onen){timeout=cd;onen=true;c=true}const e=scriptResourceCache.gettime(n);let t=(new Date).getTime();let i="";if(target=="Loon"){let n="";const s={"1分钟":6e4,"5分钟":3e5,"10分钟":6e5,"30分钟":18e5,"1小时":36e5,"2小时":72e5,"3小时":108e5,"6小时":216e5,"12小时":432e5,"24小时":864e5,"48小时":1728e5,"72小时":2592e5,"参数传入":"innums"};u=$persistentStore.read("节点缓存有效期");n=s[u]||1728e5;if(n=="innums"){n=innum}i=zhTime(parseInt(e,10)-t+parseInt(n,10))}else if(target=="Surge"&&Sue){i=zhTime(parseInt(e,10)-t+parseInt(innum,10))}else{i=zhTime(parseInt(e,10)-t+parseInt(TIMEDKEY,10))}a=`, ${i}后过期 \n`}}catch(e){}})));r+=1}let n=0;while(n<e.length){const t=e.slice(n,n+s);await Promise.all(t.map((async e=>{try{const t=await AliD(e.server);console.log("alikey=== "+JSON.stringify(t));if(t=="keyn"){noali=true}else if(/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(t)){v4=true;e.keyrk=t}else if(/^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/.test(t)){v6=true;e.keyrk=t}const n=await OUTIA(e);e.keyld=n.query;if(debug){e.keyoutld=n}let i="",s="",o="",r="",a="",u="",c="",f="",m="",l="",g="",d=true;if(n.country=="中国"){i=n.city}else{i=n.country;if(yw){i=n.countryCode}}console.log("outip为"+n.query);console.log("outip存档为"+e.keyrk);console.log("alikey为"+t);console.log("alikey存档为"+e.keyrk);if(!noali&&v4&&(!e.keyrk||e.keyld!==e.keyrk)){const i=await SPEC(e.server,t);if(i.country=="中国"){if(debug){e.keyinsp=i}console.log("spapi=== "+JSON.stringify(i));s=i.ip;if(debug){console.log("国内入口🌸 "+JSON.stringify(i))}if(debug){console.log("落地信息🍓 "+JSON.stringify(n))}if(city&&sheng){if(i.city==i.regionName){c=i.city}else{c=i.regionName+FGF+i.city}}else if(city){c=i.city}else if(sheng){c=i.regionName}if(/电信|联通|移动|广电/.test(i.isp)){r=i.isp.replace(/中国/g,"")}else if(yun){r=i.isp}else{r="企业"}if(flag){if(isp){const e={"电信":"🅳","联通":"🅻","移动":"🆈","广电":"🅶"};if(e.hasOwnProperty(r)){a=e[r]}else{a="🅲"}}}else{a=r}}else{d=false}}if(noali||v6||!d){const t=await INIA(e.server);if(debug){e.keyinipapi=t}if(debug){console.log("ipapi入口 "+JSON.stringify(t))}if(t.country=="中国"){if(city&&sheng){if(t.city==t.regionName){c=t.city}else{c=t.regionName+FGF+t.city}}else if(city){c=t.city}else if(sheng){c=t.regionName}r="";if(flag){a="🅲"}}else{c=t.country;r=t.country;if(flag){a="🆉"}}s=t.ip}else if(e.keyld==e.keyrk){c="直连";r="";if(flag){a="🆉"}s=e.keyrk}regexArray.forEach(((t,n)=>{if(t.test(e.name)){f=valueArray[n]}}));if(isp&&city||sheng&&city||isp&&sheng||sheng&&isp&&city||yun){if(flag||yun||sheng||city){m=a+c+FGF}else{m=c+r+FGF}}else if(flag){m=a+FGF}else if(isp||yun){m=r+FGF}else if(city||sheng){m=c+FGF}else{m=""}if(flag&&!isp&&!city&&!sheng&&!yun){m=""}if(game){if(f===""){u=""}else{const e={Game:"🎮"};if(e.hasOwnProperty(f)){u=e[f]}else{u=""}}}else{u=""}if(bl){const t=e.name.match(/(倍率\D?((\d\.)?\d+)\D?)|((\d\.)?\d+)(倍|X|x|×)/);if(t){const e=t[0].match(/(\d[\d.]*)/)[0];if(e!=="1"){const t=e+"×";l=t}}if(u!==""){o=i+u+l}else if(l!==""){o=i+u+XHFGF+l}else{o=i}}else{o=i+u}if(flag){g=getflag(n.countryCode)}else{g=""}if(dns){e.server=s}e.name=m+g+o;e.qc=s+n.query}catch(e){}})));if(!onen){await sleep(50)}n+=s}t++;e=removels(e);if(e.length<o*.2&&t===1){await sleep(50)}}while(e.length<o*.2&&t<2);if(t<3){console.log("任务执行次数: "+t)}e=removeqc(e);e=jxh(e);if(keynames!==""){e.forEach((e=>{e.name=keynames+" "+e.name}))}numone&&(e=onee(e));let f=e.length;const m=new Date;const l=m.getTime()-n.getTime();if(dns){console.log(`dns解析后共: ${f} 个`)}apiRead>0?console.log(`读取api缓存: ${apiRead} 个`):null;apiw>0?console.log(`写入api缓存: ${apiw} 个`):null;console.log(`处理完后剩余: ${f} 个`);if(target=="Loon"){console.log("缓存过期时间: "+u+", 还剩"+a.replace(/,|\n/g,""))}else{console.log("缓存过期时间: "+zhTime(TIMEDKEY)+", 还剩"+a.replace(/,|\n/g,""))}console.log(`此方法总用时: ${zhTime(l)}\n----For New CNAME----`);const g=apiRead?`读取缓存:${apiRead} `:"";const d=apiw?`写入缓存:${apiw}, `:"";const h=f==o?"全部通过测试, ":"去除无效节点后有"+f+"个, ";if(!offtz){$notification.post(`${tzname}共${o}个节点`,"",`${d}${g}${a}${h}用时:${zhTime(l)}`)}return e}var MD5=function(e){var t=M(V(Y(X(e),8*e.length)));return t.toLowerCase()};function M(e){for(var t,n="0123456789ABCDEF",i="",s=0;s<e.length;s++)t=e.charCodeAt(s),i+=n.charAt(t>>>4&15)+n.charAt(15&t);return i}function X(e){for(var t=Array(e.length>>2),n=0;n<t.length;n++)t[n]=0;for(n=0;n<8*e.length;n+=8)t[n>>5]|=(255&e.charCodeAt(n/8))<<n%32;return t}function V(e){for(var t="",n=0;n<32*e.length;n+=8)t+=String.fromCharCode(e[n>>5]>>>n%32&255);return t}function Y(e,t){e[t>>5]|=128<<t%32,e[14+(t+64>>>9<<4)]=t;for(var n=1732584193,i=-271733879,s=-1732584194,o=271733878,r=0;r<e.length;r+=16){var a=n,u=i,c=s,f=o;i=md5_ii(i=md5_ii(i=md5_ii(i=md5_ii(i=md5_hh(i=md5_hh(i=md5_hh(i=md5_hh(i=md5_gg(i=md5_gg(i=md5_gg(i=md5_gg(i=md5_ff(i=md5_ff(i=md5_ff(i=md5_ff(i,s=md5_ff(s,o=md5_ff(o,n=md5_ff(n,i,s,o,e[r+0],7,-680876936),i,s,e[r+1],12,-389564586),n,i,e[r+2],17,606105819),o,n,e[r+3],22,-1044525330),s=md5_ff(s,o=md5_ff(o,n=md5_ff(n,i,s,o,e[r+4],7,-176418897),i,s,e[r+5],12,1200080426),n,i,e[r+6],17,-1473231341),o,n,e[r+7],22,-45705983),s=md5_ff(s,o=md5_ff(o,n=md5_ff(n,i,s,o,e[r+8],7,1770035416),i,s,e[r+9],12,-1958414417),n,i,e[r+10],17,-42063),o,n,e[r+11],22,-1990404162),s=md5_ff(s,o=md5_ff(o,n=md5_ff(n,i,s,o,e[r+12],7,1804603682),i,s,e[r+13],12,-40341101),n,i,e[r+14],17,-1502002290),o,n,e[r+15],22,1236535329),s=md5_gg(s,o=md5_gg(o,n=md5_gg(n,i,s,o,e[r+1],5,-165796510),i,s,e[r+6],9,-1069501632),n,i,e[r+11],14,643717713),o,n,e[r+0],20,-373897302),s=md5_gg(s,o=md5_gg(o,n=md5_gg(n,i,s,o,e[r+5],5,-701558691),i,s,e[r+10],9,38016083),n,i,e[r+15],14,-660478335),o,n,e[r+4],20,-405537848),s=md5_gg(s,o=md5_gg(o,n=md5_gg(n,i,s,o,e[r+9],5,568446438),i,s,e[r+14],9,-1019803690),n,i,e[r+3],14,-187363961),o,n,e[r+8],20,1163531501),s=md5_gg(s,o=md5_gg(o,n=md5_gg(n,i,s,o,e[r+13],5,-1444681467),i,s,e[r+2],9,-51403784),n,i,e[r+7],14,1735328473),o,n,e[r+12],20,-1926607734),s=md5_hh(s,o=md5_hh(o,n=md5_hh(n,i,s,o,e[r+5],4,-378558),i,s,e[r+8],11,-2022574463),n,i,e[r+11],16,1839030562),o,n,e[r+14],23,-35309556),s=md5_hh(s,o=md5_hh(o,n=md5_hh(n,i,s,o,e[r+1],4,-1530992060),i,s,e[r+4],11,1272893353),n,i,e[r+7],16,-155497632),o,n,e[r+10],23,-1094730640),s=md5_hh(s,o=md5_hh(o,n=md5_hh(n,i,s,o,e[r+13],4,681279174),i,s,e[r+0],11,-358537222),n,i,e[r+3],16,-722521979),o,n,e[r+6],23,76029189),s=md5_hh(s,o=md5_hh(o,n=md5_hh(n,i,s,o,e[r+9],4,-640364487),i,s,e[r+12],11,-421815835),n,i,e[r+15],16,530742520),o,n,e[r+2],23,-995338651),s=md5_ii(s,o=md5_ii(o,n=md5_ii(n,i,s,o,e[r+0],6,-198630844),i,s,e[r+7],10,1126891415),n,i,e[r+14],15,-1416354905),o,n,e[r+5],21,-57434055),s=md5_ii(s,o=md5_ii(o,n=md5_ii(n,i,s,o,e[r+12],6,1700485571),i,s,e[r+3],10,-1894986606),n,i,e[r+10],15,-1051523),o,n,e[r+1],21,-2054922799),s=md5_ii(s,o=md5_ii(o,n=md5_ii(n,i,s,o,e[r+8],6,1873313359),i,s,e[r+15],10,-30611744),n,i,e[r+6],15,-1560198380),o,n,e[r+13],21,1309151649),s=md5_ii(s,o=md5_ii(o,n=md5_ii(n,i,s,o,e[r+4],6,-145523070),i,s,e[r+11],10,-1120210379),n,i,e[r+2],15,718787259),o,n,e[r+9],21,-343485551),n=safe_add(n,a),i=safe_add(i,u),s=safe_add(s,c),o=safe_add(o,f)}return Array(n,i,s,o)}function md5_cmn(e,t,n,i,s,o){return safe_add(bit_rol(safe_add(safe_add(t,e),safe_add(i,o)),s),n)}function md5_ff(e,t,n,i,s,o,r){return md5_cmn(t&n|~t&i,e,t,s,o,r)}function md5_gg(e,t,n,i,s,o,r){return md5_cmn(t&i|n&~i,e,t,s,o,r)}function md5_hh(e,t,n,i,s,o,r){return md5_cmn(t^n^i,e,t,s,o,r)}function md5_ii(e,t,n,i,s,o,r){return md5_cmn(n^(t|~i),e,t,s,o,r)}function safe_add(e,t){var n=(65535&e)+(65535&t);return(e>>16)+(t>>16)+(n>>16)<<16|65535&n}function bit_rol(e,t){return e<<t|e>>>32-t}function getid(e){let t="ld";return MD5(`${t}-${e.server}-${e.port}`)}function getinid(e){let t="ia";return MD5(`${t}-${e}`)}function getaliid(e){let t="al";return MD5(`${t}-${e}`)}function getspcn(e){let t="sc";return MD5(`${t}-${e}`)}