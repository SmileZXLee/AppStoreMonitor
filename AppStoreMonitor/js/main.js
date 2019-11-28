/**
 * AppStoreMonitor
 * @author ZXLee
 * @github https://github.com/SmileZXLee/AppStoreMonitor
 */
var vm = new Vue({
	el: '.main',
	data: {
		running: false,
		showRequestNotification: false,
		startBtnText: '开始',
		startBtnBacColor: '#1090fc',
		appid: localStorage.getItem('appid'),
		detailList: [],
		lastBundleID: '',
		lastVersion: '',
		timer: null
	},	
	mounted () {
		if (!("Notification" in window)) {
	         alert("您的浏览器不支持通知功能");
			 this.showRequestNotification = true;
		}else if (Notification.permission === "granted") {
			 this.showRequestNotification = false;
		}else if (Notification.permission !== 'denied') {
			this.showRequestNotification = true;
			var $this = this;
			 Notification.requestPermission(function(permission) {
				 if (permission === "granted") {
					 $this.showRequestNotification = false;
				 }else{
					 $this.showRequestNotification = true;
				 }
			 });
		}else{
			this.showRequestNotification = true;
		}
	},
	watch:{
		appid(val){
			localStorage.setItem('appid',val);
		}
	},
	methods:{
		srart(){
			if(!this.appid.length){
				return;
			}
			var $this = this;
			if(this.startBtnText == '开始'){
				this.startBtnText = '加载中...';
				this.requestDetailData(true);
				this.timer = setInterval(function(){
					$this.requestDetailData(false);
				},20000)
				this.running = true;
			}else if(this.startBtnText == '结束'){
				this.end();
			}
			
		},
		timeFormat(inputTime){
			if(!inputTime && typeof inputTime !== 'number'){
				return '';
			}
			var localTime = '';
			inputTime = new Date(inputTime).getTime();
			const offset = (new Date()).getTimezoneOffset();
			localTime = (new Date(inputTime - offset * 60000)).toISOString();
			localTime = localTime.substr(0, localTime.lastIndexOf('.'));
			localTime = localTime.replace('T', ' ');
			return localTime;
		},
		currentTime(){
			const time = new Date()
			let y = time.getFullYear()
			let m = time.getMonth()+1
			let d = time.getDate()
			let h = time.getHours()
			let mi = time.getMinutes()
			let s = time.getSeconds()
			m = m<10?`0${m}`:m
			d = d<10?`0${d}`:d
			h = h<10?`0${h}`:h
			mi = mi<10?`0${mi}`:mi
			s = s<10?`0${s}`:s
			return `${y}-${m}-${d} ${h}:${mi}:${s}`
		},
		requestDetailData(isFromClick){
			var $this = this;
			$.ajax({
			    url: "https://itunes.apple.com/lookup?id=" + this.appid,
			    dataType: 'jsonp',
			    crossDomain: true,
			    success: function(data) {
					console.log(data);
			        var results = data.results;
					if(results.length){
						var detail = results[0];
						//应用名称
						var trackName = detail.trackName;
						//bundleId
						var bundleId = detail.bundleId;
						//开发商
						var sellerName = detail.sellerName;
						//上架时间
						var releaseDate = detail.releaseDate;
						//版本号
						var version = detail.version;
						//版本发布时间
						var currentVersionReleaseDate = detail.currentVersionReleaseDate;
						//版本描述
						var releaseNotes = detail.releaseNotes;
						var detailList = [
							{name:"应用名称",detail:trackName},
							{name:"BundleId",detail:bundleId},
							{name:"开发商",detail:sellerName},
							{name:"上架时间",detail:$this.timeFormat(releaseDate)},
							{name:"最新版本号",detail:version},
							{name:"最新版本发布时间",detail:$this.timeFormat(currentVersionReleaseDate)},
							{name:"最新版本描述",detail:releaseNotes},
							{name:"数据更新时间",detail:$this.currentTime()},
								
						]
						$this.detailList = detailList;
						if(isFromClick){
							$this.startBtnText = '结束';
							$this.startBtnBacColor = 'red';
						}
						if($this.lastBundleID.length && $this.lastVersion.length && $this.lastBundleID == bundleId){
							if($this.lastVersion != version){
								$this.sendNotice(version,$this.timeFormat(currentVersionReleaseDate));
								//有新版本
								alert('发现新版本V' + version);
							}
						}
						$this.lastBundleID = bundleId;
						$this.lastVersion = version;
						
					}else{
						alert('未查询到此应用信息');
						$this.end();
					}
			    },
				error: function(data) {
			        alert('请求失败')
			    }
			});
		},
		end(){
			this.startBtnText = '开始';
			this.startBtnBacColor = '#1090fc';
			if(this.timer){
				clearInterval(this.timer);
				this.running = false;
			}
		},
		sendNotice(version,versionTime){
			var notification = new Notification("您在AppStore上的App有新版本",
			{body:'版本号:'+version+"\n更新时间:"+versionTime,icon:"https://static.ifafu.cn/AppStoreMonitorLogo.png",
			});		
			notification.onclick = function(){		
			    notification.close()		
			}
		},
		copyRightClick(){
			window.open('https://github.com/SmileZXLee/AppStoreMonitor')
		}
	},
});