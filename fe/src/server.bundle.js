require("source-map-support").install();
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(__dirname) {'use strict';

	var _express = __webpack_require__(1);

	var _express2 = _interopRequireDefault(_express);

	var _path = __webpack_require__(2);

	var _path2 = _interopRequireDefault(_path);

	var _httpProxy = __webpack_require__(3);

	var _httpProxy2 = _interopRequireDefault(_httpProxy);

	var _react = __webpack_require__(4);

	var _react2 = _interopRequireDefault(_react);

	var _reactRouter = __webpack_require__(5);

	var _server = __webpack_require__(6);

	var _reactRedux = __webpack_require__(7);

	var _routes = __webpack_require__(8);

	var _routes2 = _interopRequireDefault(_routes);

	var _configureStore = __webpack_require__(65);

	var _configureStore2 = _interopRequireDefault(_configureStore);

	var _renderPage = __webpack_require__(75);

	var _renderPage2 = _interopRequireDefault(_renderPage);

	var _fetchDependentData = __webpack_require__(76);

	var _fetchDependentData2 = _interopRequireDefault(_fetchDependentData);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	// 配置wepack-middleware


	//import {createLocation} from 'history/lib/LocationUtils'; // 用这个消除index.js.map 的恶心bug
	var webpack = __webpack_require__(77);
	var webpackHotMiddleware = __webpack_require__(78);
	var webpackDevMiddleware = __webpack_require__(79);
	var config = __webpack_require__(80);

	var app = (0, _express2.default)();

	var compiler = webpack(config);
	app.use(webpackDevMiddleware(compiler, { noInfo: true, publicPath: config.output.publicPath }));
	app.use(webpackHotMiddleware(compiler));

	// 配置http和socket服务器， 配置mqtt客户端
	var server = __webpack_require__(85).Server(app);
	var mqtt = __webpack_require__(54);
	var io = __webpack_require__(86)(server);

	var resourceDir = _path2.default.resolve(__dirname, '../../resources');
	app.use(_express2.default.static(resourceDir, { maxAge: '365d' }));

	/***********************************1. 代理费服务器*****************************/
	var proxy = _httpProxy2.default.createProxyServer({
		target: 'http://localhost:3000/api'
	});

	app.use('/api', function (req, res) {
		// 处理代理转发
		proxy.web(req, res);
	});

	proxy.on('error', function (error, req, res) {
		//proxy错误处理s
		var json = void 0;
		if (error.code !== 'ECONNRESET') {
			console.error('proxy error', error);
		}
		if (!res.headersSent) {
			res.writeHead(500, { 'content-type': 'application/json' });
		}

		json = { error: 'proxy_error', reason: error.message };
		res.end(JSON.stringify(json));
	});

	/**************************2.服务器端路由渲染**************************************/
	var store = (0, _configureStore2.default)();

	// 作为中间件使用
	app.use(function (req, res, next) {
		if (req.originalUrl.includes('index.js.map')) {
			next();
		}
		//const location = createLocation(req.url);

		(0, _reactRouter.match)({ routes: _routes2.default, location: req.url }, function (err, redirect, renderProps) {
			// 传入一个对象和回调！！
			console.log('当前请求的url：' + req.url);

			if (err) {
				console.info(err);
				return res.status(500).send(err.message);
			} else if (redirect) {
				return res.status(302).redirect(redirect.pathname + redirect.search);
			} else if (!renderProps) {
				return res.status(404).send('Not Found');
			}
			// 处理完异常情况，接下来正式渲染页面
			// 服务器端同步渲染
			//服务器端，同步处理组件初始的依赖数据,依赖数据返回之前尽量不要renderToString，否则前后端渲染不一致
			(0, _fetchDependentData2.default)(store.dispatch, renderProps.components, renderProps.params).then(function () {
				// then 调用时，store状态已经发生了变化
				// 将app应用渲染成html字符串
				// renderToString()的时机最好放在依赖数据全部返回，store状态变化后，以此【避免前后端不一致问题】
				var appHtml = (0, _server.renderToString)(_react2.default.createElement(
					_reactRedux.Provider,
					{ store: store },
					_react2.default.createElement(_reactRouter.RouterContext, renderProps)
				));
				console.log('服务器端渲染初始状态为:', store.getState());
				return (0, _renderPage2.default)(appHtml, store.getState()); // 内部promise执行完成后相当于dispatch了新动作，导致state更新了。！！
			}).then(function (html) {
				return res.status(200).end(html);
			}).catch(function (err) {
				console.log(err.message);
				res.status(500).send('抓取数据错误！！');
			});
		});
	});

	// 不直接用app，因为server里面包含着socket.io的服务
	server.listen(3001, function () {
		// 渲染服务器(api代理服务器)运行在3001端口
		console.log('Render Server is running on port 3001');
	});

	io.on('connection', function (socket) {
		console.log('成功连接至socket.io服务器');
	});
	/* WEBPACK VAR INJECTION */}.call(exports, "fe\\src"))

/***/ },
/* 1 */
/***/ function(module, exports) {

	module.exports = require("express");

/***/ },
/* 2 */
/***/ function(module, exports) {

	module.exports = require("path");

/***/ },
/* 3 */
/***/ function(module, exports) {

	module.exports = require("http-proxy");

/***/ },
/* 4 */
/***/ function(module, exports) {

	module.exports = require("react");

/***/ },
/* 5 */
/***/ function(module, exports) {

	module.exports = require("react-router");

/***/ },
/* 6 */
/***/ function(module, exports) {

	module.exports = require("react-dom/server");

/***/ },
/* 7 */
/***/ function(module, exports) {

	module.exports = require("react-redux");

/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _react = __webpack_require__(4);

	var _react2 = _interopRequireDefault(_react);

	var _reactRouter = __webpack_require__(5);

	var _App = __webpack_require__(9);

	var _App2 = _interopRequireDefault(_App);

	var _Home = __webpack_require__(29);

	var _Home2 = _interopRequireDefault(_Home);

	var _Monitor = __webpack_require__(33);

	var _Monitor2 = _interopRequireDefault(_Monitor);

	var _VehicleSelector = __webpack_require__(55);

	var _VehicleSelector2 = _interopRequireDefault(_VehicleSelector);

	var _Path = __webpack_require__(58);

	var _Path2 = _interopRequireDefault(_Path);

	var _Api = __webpack_require__(60);

	var _Api2 = _interopRequireDefault(_Api);

	var _UserCenter = __webpack_require__(62);

	var _UserCenter2 = _interopRequireDefault(_UserCenter);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	exports.default = _react2.default.createElement(
	  _reactRouter.Route,
	  { path: '/', component: _App2.default },
	  _react2.default.createElement(_reactRouter.IndexRoute, { component: _Home2.default }),
	  _react2.default.createElement(_reactRouter.Route, { path: 'monitor', component: _VehicleSelector2.default }),
	  _react2.default.createElement(_reactRouter.Route, { path: 'monitor/:id', component: _Monitor2.default }),
	  _react2.default.createElement(_reactRouter.Route, { path: 'uc/:id', component: _UserCenter2.default }),
	  _react2.default.createElement(_reactRouter.Route, { path: 'path', component: _Path2.default }),
	  _react2.default.createElement(_reactRouter.Route, { path: 'api', component: _Api2.default })
	);

/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
			value: true
	});

	var _react = __webpack_require__(4);

	var _react2 = _interopRequireDefault(_react);

	var _Navbar = __webpack_require__(10);

	var _Navbar2 = _interopRequireDefault(_Navbar);

	var _BreadCumb = __webpack_require__(25);

	var _BreadCumb2 = _interopRequireDefault(_BreadCumb);

	var _App = __webpack_require__(28);

	var _App2 = _interopRequireDefault(_App);

	var _reactRedux = __webpack_require__(7);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	// 需要注意的是App相当于布局容器不同的布局模式，例如双栏布局，三栏布局等模式都可以在这个文件中写。
	// App只是容器，不涉及具体的布局，因此如果在路由的时候需要变更布局的模式（两栏变三栏），则可以在App内部
	// 加载不同的布局模式，布局模式可以单独的写一系列文件处理。

	// App是整个前端应用级的组件（后台应用需要构造不同的整体架构，不能直接套用这个App作为根了），对于这样应用级的组件可以写在App中，内部加载各个页面的内容组件就行。

	// 这个页面也可以称为Layout，可以直接将应用级的组件都以dom的形式写在这里，并添加css样式，不用再以组件的方式写了，因为全局性的组件不会复用的，只使用一次！
	var App = function App(props) {
			return (// 这里放的都是应用级复用的组件，排版和布局也在这里进行，各自应用各自排版！例如Home组件是个容器，内部布局必须在Home内部做好
					_react2.default.createElement(
							'div',
							{ id: 'react-view' },
							_react2.default.createElement(
									'header',
									null,
									_react2.default.createElement(_Navbar2.default, { loc: props.location }),
									props.location.pathname == '/' ? "" : _react2.default.createElement(_BreadCumb2.default, { location: props.location })
							),
							props.children,
							_react2.default.createElement('footer', null)
					)
			);
	};
	exports.default = (0, _reactRedux.connect)()(App);

/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});

	var _react = __webpack_require__(4);

	var _react2 = _interopRequireDefault(_react);

	var _NavbarBrand = __webpack_require__(11);

	var _NavbarBrand2 = _interopRequireDefault(_NavbarBrand);

	var _NavbarMenu = __webpack_require__(13);

	var _NavbarMenu2 = _interopRequireDefault(_NavbarMenu);

	var _NavbarExtra = __webpack_require__(15);

	var _NavbarExtra2 = _interopRequireDefault(_NavbarExtra);

	var _Navbar = __webpack_require__(23);

	var _Navbar2 = _interopRequireDefault(_Navbar);

	var _classname = __webpack_require__(24);

	var _classname2 = _interopRequireDefault(_classname);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var Navbar = function Navbar(props) {
		return _react2.default.createElement(
			'nav',
			{ className: _Navbar2.default.root },
			_react2.default.createElement(_NavbarBrand2.default, null),
			_react2.default.createElement(_NavbarMenu2.default, { loc: props.loc }),
			_react2.default.createElement(_NavbarExtra2.default, null)
		);
	};

	exports.default = Navbar;

/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});

	var _react = __webpack_require__(4);

	var _react2 = _interopRequireDefault(_react);

	var _NavbarBrand = __webpack_require__(12);

	var _NavbarBrand2 = _interopRequireDefault(_NavbarBrand);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var NavbarBrand = function NavbarBrand(props) {
		return _react2.default.createElement(
			'h1',
			{ className: _NavbarBrand2.default.root },
			'Veichle'
		);
	};

	exports.default = NavbarBrand;

/***/ },
/* 12 */
/***/ function(module, exports) {

	module.exports = {
		"root": "NavbarBrand__root-1nO-V"
	};

/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _react = __webpack_require__(4);

	var _react2 = _interopRequireDefault(_react);

	var _NavLink = __webpack_require__(14);

	var _NavLink2 = _interopRequireDefault(_NavLink);

	var _NavbarExtra = __webpack_require__(15);

	var _NavbarExtra2 = _interopRequireDefault(_NavbarExtra);

	var _NavbarMenu = __webpack_require__(21);

	var _NavbarMenu2 = _interopRequireDefault(_NavbarMenu);

	var _classnames = __webpack_require__(22);

	var _classnames2 = _interopRequireDefault(_classnames);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var NavbarMenu = function (_Component) {
		_inherits(NavbarMenu, _Component);

		function NavbarMenu(props) {
			_classCallCheck(this, NavbarMenu);

			var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(NavbarMenu).call(this, props));

			_this.state = {
				expand: false // 子菜单是否展开
			};

			_this.toggleNav = _this.toggleNav.bind(_this);
			return _this;
		}

		_createClass(NavbarMenu, [{
			key: 'toggleNav',
			value: function toggleNav() {
				this.setState({ expand: !this.state.expand });
			}
		}, {
			key: 'render',
			value: function render() {
				var loc = this.props.loc;
				var path = loc.pathname;
				return _react2.default.createElement(
					'div',
					null,
					_react2.default.createElement(
						'div',
						{ className: _NavbarMenu2.default.toggle, onClick: this.toggleNav },
						'|||'
					),
					_react2.default.createElement(
						'ul',
						{ className: _NavbarMenu2.default.root },
						_react2.default.createElement(
							'li',
							{ className: _NavbarMenu2.default['menu-item'], key: '1', 'data-role': 'navlink' },
							_react2.default.createElement(
								_NavLink2.default,
								{ to: '/', isIndex: true, isActive: path === '/' },
								_react2.default.createElement(
									'i',
									{ className: 'iconfont' },
									''
								),
								' 首页'
							)
						),
						_react2.default.createElement(
							'li',
							{ className: _NavbarMenu2.default['menu-item'], key: '2', 'data-role': 'navlink' },
							_react2.default.createElement(
								_NavLink2.default,
								{ to: '/monitor', isActive: path.startsWith('/monitor') },
								_react2.default.createElement(
									'i',
									{ className: 'iconfont' },
									''
								),
								' 监控'
							)
						),
						_react2.default.createElement(
							'li',
							{ className: _NavbarMenu2.default['menu-item'], key: '4', 'data-role': 'navlink' },
							_react2.default.createElement(
								_NavLink2.default,
								{ to: '/api' },
								_react2.default.createElement(
									'i',
									{ className: 'iconfont' },
									''
								),
								' API'
							)
						),
						_react2.default.createElement(
							'li',
							{ className: _NavbarMenu2.default['menu-item'], key: '5', 'data-role': 'navlink' },
							_react2.default.createElement(
								_NavLink2.default,
								{ to: '/feedback' },
								_react2.default.createElement(
									'i',
									{ className: 'iconfont' },
									''
								),
								' 反馈'
							)
						)
					),
					_react2.default.createElement(
						'ul',
						{ className: _NavbarMenu2.default['root-little'], style: { display: this.state.expand ? 'block' : 'none' } },
						_react2.default.createElement(
							'li',
							{ onClick: this.toggleNav, className: _NavbarMenu2.default['menu-item'], key: '1', 'data-role': 'navlink' },
							_react2.default.createElement(
								_NavLink2.default,
								{ to: '/', isIndex: true, isActive: path === '/' },
								_react2.default.createElement(
									'i',
									{ className: 'iconfont' },
									''
								),
								' 首页'
							)
						),
						_react2.default.createElement(
							'li',
							{ onClick: this.toggleNav, className: _NavbarMenu2.default['menu-item'], key: '2', 'data-role': 'navlink' },
							_react2.default.createElement(
								_NavLink2.default,
								{ to: '/monitor', isActive: path.startsWith('/monitor') },
								_react2.default.createElement(
									'i',
									{ className: 'iconfont' },
									''
								),
								' 监控'
							)
						),
						_react2.default.createElement(
							'li',
							{ onClick: this.toggleNav, className: _NavbarMenu2.default['menu-item'], key: '4', 'data-role': 'navlink' },
							_react2.default.createElement(
								_NavLink2.default,
								{ to: '/api' },
								_react2.default.createElement(
									'i',
									{ className: 'iconfont' },
									''
								),
								' API'
							)
						),
						_react2.default.createElement(
							'li',
							{ onClick: this.toggleNav, className: _NavbarMenu2.default['menu-item'], key: '5', 'data-role': 'navlink' },
							_react2.default.createElement(
								_NavLink2.default,
								{ to: '/feedback' },
								_react2.default.createElement(
									'i',
									{ className: 'iconfont' },
									''
								),
								' 反馈'
							)
						)
					)
				);
			}
		}]);

		return NavbarMenu;
	}(_react.Component);

	exports.default = NavbarMenu;

/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});

	var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

	var _react = __webpack_require__(4);

	var _react2 = _interopRequireDefault(_react);

	var _reactRouter = __webpack_require__(5);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var NavLink = function NavLink(props) {
		var isActive = props.isActive || false;
		// NavLink处理两类事件：1.activeClassName /activeStyle  2.IndexLink
		return props.isIndex ? _react2.default.createElement(_reactRouter.IndexLink, _extends({ activeClassName: 'nav-active' }, props)) : _react2.default.createElement(_reactRouter.Link, _extends({ activeClassName: 'nav-active' }, props));
	};

	exports.default = NavLink;

/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});

	var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _react = __webpack_require__(4);

	var _react2 = _interopRequireDefault(_react);

	var _NavbarExtra = __webpack_require__(16);

	var _NavbarExtra2 = _interopRequireDefault(_NavbarExtra);

	var _Modal = __webpack_require__(17);

	var _Modal2 = _interopRequireDefault(_Modal);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var NavbarExtra = function (_Component) {
		_inherits(NavbarExtra, _Component);

		function NavbarExtra(props) {
			_classCallCheck(this, NavbarExtra);

			var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(NavbarExtra).call(this, props));

			_this.state = {
				isShow: false,
				btnState: null,
				isLogged: false // 标志用户登录状态
			};

			_this.handleLogin = _this.handleLogin.bind(_this);
			_this.handleReg = _this.handleReg.bind(_this);
			return _this;
		}

		_createClass(NavbarExtra, [{
			key: 'componentDidMount',
			value: function componentDidMount() {
				var loggedUser = sessionStorage.getItem('_user');
				try {
					loggedUser = JSON.parse(loggedUser);
					if (loggedUser != null) {
						this._user = loggedUser;
						this.setState(function (prevProps, prevState) {
							return Object.assign({}, prevState, {
								isLogged: true
							});
						});
					}
				} catch (err) {
					console.log('未登录的用户');
				}
			}
		}, {
			key: 'handleLogin',
			value: function handleLogin() {
				this.setState(function (prevProps, prevState) {
					return Object.assign({}, prevState, { isShow: true, btnState: 'login' });
				});
			}
		}, {
			key: 'handleReg',
			value: function handleReg() {
				this.setState(function (prevProps, prevState) {
					return Object.assign({}, prevState, { isShow: true, btnState: 'reg' });
				});
			}
		}, {
			key: 'changeModalVisible',
			value: function changeModalVisible(isShow) {
				this.setState({ isShow: isShow });
			}
		}, {
			key: 'render',
			value: function render() {
				var _this2 = this;

				return _react2.default.createElement(
					'div',
					{ className: _NavbarExtra2.default.root },
					_react2.default.createElement(
						'div',
						{ style: { display: this.state.isLogged ? 'none' : 'inline-block' } },
						_react2.default.createElement(
							'a',
							{ href: '#', className: _NavbarExtra2.default['user-btn'], onClick: this.handleLogin },
							'登录'
						),
						_react2.default.createElement(
							'a',
							{ href: '#', className: _NavbarExtra2.default['user-btn'], onClick: this.handleReg },
							'注册'
						)
					),
					_react2.default.createElement(
						'div',
						{ style: { display: this.state.isLogged ? 'inline-block' : 'none' }, className: _NavbarExtra2.default.logged },
						_react2.default.createElement(
							'a',
							{ href: '/uc/' + (this._user && this._user._id) },
							_react2.default.createElement('img', { src: 'https://avatars0.githubusercontent.com/u/12195736?v=3&s=40', title: this._user && this._user.username })
						)
					),
					_react2.default.createElement(_Modal2.default, _extends({}, this.state, { changeModalVisible: function changeModalVisible(isShow) {
							_this2.changeModalVisible(isShow);
						},
						handleReg: this.handleReg, handleLogin: this.handleLogin
					}))
				);
			}
		}]);

		return NavbarExtra;
	}(_react.Component);

	exports.default = NavbarExtra;

/***/ },
/* 16 */
/***/ function(module, exports) {

	module.exports = {
		"root": "NavbarExtra__root-2StMZ",
		"user-btn": "NavbarExtra__user-btn-1HiRH",
		"logged": "NavbarExtra__logged-1__hN"
	};

/***/ },
/* 17 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _react = __webpack_require__(4);

	var _react2 = _interopRequireDefault(_react);

	var _Modal = __webpack_require__(18);

	var _Modal2 = _interopRequireDefault(_Modal);

	var _isomorphicFetch = __webpack_require__(19);

	var _isomorphicFetch2 = _interopRequireDefault(_isomorphicFetch);

	var _env = __webpack_require__(20);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var Modal = function (_Component) {
		_inherits(Modal, _Component);

		function Modal(prop) {
			_classCallCheck(this, Modal);

			var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Modal).call(this, prop));

			_this.login = _this.login.bind(_this);
			_this.reg = _this.reg.bind(_this);
			return _this;
		}

		_createClass(Modal, [{
			key: 'login',
			value: function login(username, password) {
				if (username == null || password == null) {
					return false;
				}
				var url = _env.C.apiBase + '/login';
				(0, _isomorphicFetch2.default)(url, {
					method: 'post',
					cache: 'default',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify({ username: username, password: password })
				}).then(function (res) {
					return res.json();
				}).then(function (data) {
					if (data.result == 'ok') {
						// 写入sessionStorage,保持登录
						alert('登入成功');
						sessionStorage.setItem('_user', JSON.stringify(data.user));
						location.reload(); // 登录成功后刷新页面
					} else {
							alert('登入失败');
						}
				});
			}
		}, {
			key: 'reg',
			value: function reg(username, password) {
				if (username == null || password == null) {
					return false;
				}
				var url = _env.C.apiBase + '/reg';
				(0, _isomorphicFetch2.default)(url, {
					method: 'post',
					cache: 'default',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify({ username: username, password: password })
				}).then(function (res) {
					return res.text();
				}).then(function (rs) {
					alert('注册成功');
					window.loaction.reload();
				});
			}
		}, {
			key: 'render',
			value: function render() {
				var _this2 = this;

				var _props = this.props;
				var isShow = _props.isShow;
				var btnState = _props.btnState;
				var changeModalVisible = _props.changeModalVisible;
				var handleReg = _props.handleReg;
				var handleLogin = _props.handleLogin;

				var username_login = void 0;
				var pwd_login = void 0;
				var username_reg = void 0;
				var pwd_reg = void 0;

				var loginBtn = void 0,
				    regBtn = void 0;
				if (loginBtn && btnState == 'login') {
					loginBtn.focus();
				}
				if (regBtn && btnState == 'reg') {
					regBtn.focus();
				}

				return _react2.default.createElement(
					'div',
					{
						className: _Modal2.default['root'],
						style: { display: isShow ? 'block' : 'none' },
						onClick: function onClick(e) {
							changeModalVisible(false);
						} },
					_react2.default.createElement(
						'div',
						{ className: _Modal2.default["modal"], onClick: function onClick(e) {
								e.stopPropagation();
							} },
						_react2.default.createElement(
							'h4',
							{ className: _Modal2.default["modal-desc"] },
							'智能停车系统登入系统'
						),
						_react2.default.createElement(
							'div',
							{ className: _Modal2.default["modal-title"] },
							_react2.default.createElement(
								'a',
								{ href: '#', className: _Modal2.default["login-title"], ref: function ref(node) {
										loginBtn = node;
									}, onClick: handleLogin },
								'登录'
							),
							_react2.default.createElement(
								'a',
								{ href: '#', className: _Modal2.default["reg-title"], ref: function ref(node) {
										regBtn = node;
									}, onClick: handleReg },
								'注册'
							)
						),
						_react2.default.createElement(
							'div',
							{ className: _Modal2.default["modal-body"] },
							_react2.default.createElement(
								'form',
								{ className: _Modal2.default["login-body"], style: { display: btnState == 'login' ? 'block' : 'none' },
									onSubmit: function onSubmit() {
										return _this2.login(username_login.value, pwd_login.value);
									}
								},
								_react2.default.createElement('input', { required: true, autoComplete: true, type: 'text', ref: function ref(node) {
										return username_login = node;
									}, placeholder: '登录用户名' }),
								_react2.default.createElement('input', { required: true, autoComplete: true, type: 'password', ref: function ref(node) {
										return pwd_login = node;
									}, placeholder: '密码' }),
								_react2.default.createElement('input', { type: 'submit', value: '登录' })
							),
							_react2.default.createElement(
								'form',
								{ className: _Modal2.default["reg-body"], style: { display: btnState == 'reg' ? 'block' : 'none' },
									onSubmit: function onSubmit() {
										return _this2.reg(username_reg.value, pwd_reg.value);
									}
								},
								_react2.default.createElement('input', { required: true, autoComplete: true, type: 'text', ref: function ref(node) {
										return username_reg = node;
									}, placeholder: '注册用户名' }),
								_react2.default.createElement('input', { required: true, autoComplete: true, type: 'password', ref: function ref(node) {
										return pwd_reg = node;
									}, placeholder: '密码' }),
								_react2.default.createElement('input', { required: true, autoComplete: true, type: 'password', ref: function ref(node) {
										return pwd_reg = node;
									}, placeholder: '重复密码' }),
								_react2.default.createElement('input', { type: 'submit', value: '注册' })
							)
						)
					)
				);
			}
		}]);

		return Modal;
	}(_react.Component);

	exports.default = Modal;

/***/ },
/* 18 */
/***/ function(module, exports) {

	module.exports = {
		"root": "Modal__root-lug9e",
		"modal": "Modal__modal-1sVzd",
		"modal-desc": "Modal__modal-desc-3-aV8",
		"modal-title": "Modal__modal-title-2qag9",
		"login-title": "Modal__login-title-1d-lI",
		"reg-title": "Modal__reg-title-12rk0",
		"modal-body": "Modal__modal-body-ncIEi",
		"login-body": "Modal__login-body-2BCzh"
	};

/***/ },
/* 19 */
/***/ function(module, exports) {

	module.exports = require("isomorphic-fetch");

/***/ },
/* 20 */
/***/ function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	var C = {
		apiBase: 'http://localhost:3001/api/v1'
	};

	exports.C = C;

/***/ },
/* 21 */
/***/ function(module, exports) {

	module.exports = {
		"toggle": "NavbarMenu__toggle-WrV5t",
		"root": "NavbarMenu__root-2Rbnr",
		"menu-item": "NavbarMenu__menu-item-1GUjF",
		"root-little": "NavbarMenu__root-little-1MzeR"
	};

/***/ },
/* 22 */
/***/ function(module, exports) {

	module.exports = require("classnames");

/***/ },
/* 23 */
/***/ function(module, exports) {

	module.exports = {
		"root": "Navbar__root-xqYn4"
	};

/***/ },
/* 24 */
/***/ function(module, exports) {

	module.exports = require("classname");

/***/ },
/* 25 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});

	var _react = __webpack_require__(4);

	var _react2 = _interopRequireDefault(_react);

	var _BreadCumb = __webpack_require__(26);

	var _BreadCumb2 = _interopRequireDefault(_BreadCumb);

	var _lodash = __webpack_require__(27);

	var _lodash2 = _interopRequireDefault(_lodash);

	var _reactRouter = __webpack_require__(5);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

	var BreadCumb = function BreadCumb(_ref) {
		var location = _ref.location;

		var crumbMap = _lodash2.default.zipObject(['home', 'monitor', 'recommend', 'api', 'feedback'], ['首页', '监控', '推荐', 'API', '反馈']);
		var breadCrumbs = ['home'].concat(_toConsumableArray(_lodash2.default.compact(location.pathname.split('/'))));
		var activeStyle = { color: "#333", textDecoration: "none" };
		return _react2.default.createElement(
			'ul',
			{ className: _BreadCumb2.default.root },
			breadCrumbs.map(function (crumb, index) {
				return _react2.default.createElement(
					'li',
					{ key: index, className: _BreadCumb2.default["bread-item"] },
					crumb == 'home' ? _react2.default.createElement(
						_reactRouter.IndexLink,
						{ to: '/', activeStyle: activeStyle },
						crumbMap[crumb]
					) : _react2.default.createElement(
						_reactRouter.Link,
						{ to: '/' + crumb, activeStyle: activeStyle },
						crumbMap[crumb]
					)
				);
			})
		);
	};

	exports.default = BreadCumb;

/***/ },
/* 26 */
/***/ function(module, exports) {

	module.exports = {
		"root": "BreadCumb__root-29alh",
		"bread-item": "BreadCumb__bread-item-23hg1"
	};

/***/ },
/* 27 */
/***/ function(module, exports) {

	module.exports = require("lodash");

/***/ },
/* 28 */
/***/ function(module, exports) {

	

/***/ },
/* 29 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});

	var _react = __webpack_require__(4);

	var _react2 = _interopRequireDefault(_react);

	var _ProgressBar = __webpack_require__(30);

	var _ProgressBar2 = _interopRequireDefault(_ProgressBar);

	var _Home = __webpack_require__(32);

	var _Home2 = _interopRequireDefault(_Home);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var Home = function Home(props) {
		return _react2.default.createElement(
			'div',
			{ className: _Home2.default["container"] },
			_react2.default.createElement(
				'div',
				{ className: _Home2.default["sys-desc"] },
				_react2.default.createElement(
					'h2',
					{ className: _Home2.default["desc-title"] },
					_react2.default.createElement(
						'i',
						{ className: 'iconfont', style: { font: 21 } },
						''
					),
					'系统描述'
				),
				_react2.default.createElement(
					'p',
					{ className: _Home2.default["desc-content"] },
					'随着国民经济不断发展，人民生活品质日益提高，城市汽车保有量大幅增加，停车难成为人们工作生活中的一大难题，由此造成了交通堵塞、环境污染、资源浪费等问题。本研究根据当前停车系统现状，设计了一种基于ZigBee无线传感网络的智能停车系统，通过线上线下互动管理停车位，提高了车位的利用率，有效缓解了城市停车混乱的问题。'
				)
			),
			_react2.default.createElement(
				'div',
				{ className: _Home2.default["func-desc"] },
				_react2.default.createElement(
					'h2',
					{ className: _Home2.default["desc-title"] },
					_react2.default.createElement(
						'i',
						{ className: 'iconfont', style: { font: 21 } },
						''
					),
					'功能描述'
				),
				_react2.default.createElement(
					'div',
					{ className: _Home2.default["desc-content"] },
					'经过对“滴滴打车”运作模式进行研究，基于O2O理念，结合传感网络、物联网和互联网技术，研究探讨停车智能管理的解决方案，旨在缓解停车场信息共享困难，减少用户寻找停车位的成本，提高停车管理的智能化和自动化程度。针对传统停车场所面临的困境，本系统提供了如下功能：',
					_react2.default.createElement(
						'ul',
						null,
						_react2.default.createElement(
							'li',
							{ style: { fontWeight: 700, textDecoration: 700 } },
							'1. 在线查看停车场中车位状态功能。减轻用户对停车形势的盲目性，为用户提供实时性的停车信息。'
						),
						_react2.default.createElement(
							'li',
							{ style: { fontWeight: 700, textDecoration: 700 } },
							'2. 停车场信息共享功能。各个停车场之间信息共享，减少“信息孤岛”带来的负面影响。'
						),
						_react2.default.createElement(
							'li',
							{ style: { fontWeight: 700, textDecoration: 700 } },
							'3. 在线车位预定功能。用户可以对空闲状态的车位进行标记，实现简单的预定功能。'
						),
						_react2.default.createElement(
							'li',
							{ style: { fontWeight: 700, textDecoration: 700 } },
							'4. 停车位推荐和停车场推荐。针对预定功能的缺陷，系统采用推荐算法进行车位推荐，采用地理位置索引搜索周边停车场。'
						)
					)
				)
			),
			_react2.default.createElement(
				'div',
				{ className: _Home2.default["op-desc"] },
				_react2.default.createElement(
					'h2',
					{ className: _Home2.default["desc-title"] },
					_react2.default.createElement(
						'i',
						{ className: 'iconfont', style: { font: 21 } },
						''
					),
					'使用方法'
				),
				_react2.default.createElement(
					'div',
					{ className: _Home2.default["desc-content"] },
					'使用本系统进行智能停车。',
					_react2.default.createElement(
						'p',
						null,
						' 通过点击导航栏上的“监控”，可以查看本系统中收录的所有停车场列表，列表中展示了当前停车场的名称和状态，通过点击相应名称，可以进一步查看停车场的具体车位信息。具体信息包括: 总车位数、空闲车位数、已占用车位数和已预约车位数。'
					),
					_react2.default.createElement(
						'p',
						null,
						' 在系统中可以对停车场大致信息进行概览，如果想进一步使用预约车位、停车路径规划等功能，必须先进行用户注册和登录。已登录的用户可以通过点击页面中绿色方块进行车位的预约，每个用户只可以预约一个车位，已经预约车位的用户可通过点击页面底部的“查看路线”按钮来获取停车路径的规划。'
					),
					_react2.default.createElement(
						'p',
						null,
						'已登录的用户可以通过点击页面右上角的用户头像进入“用户中心”。用户中心记录了用户在本系统中的所有操作，用户可以在此处查看已预订的车位、取消已预约的车位、查看针对当前已预约车位的推荐车位、查看当前停车场周边的停车场。'
					),
					_react2.default.createElement(
						'p',
						null,
						' 至此，用户通过本系统详细了解了目标停车场的车位状态信息，并通过“预约”功能对车位实现了软标记，即使软标记的车位被强制占用，用户也可以通过推荐功能获得新的停车位信息，系统还为用户提供了停车路径规划等功能，进一步提高了停车效率，缓解人们日常停车难问题，对促进城市交通进步有一定的积极意义。'
					)
				)
			)
		);
	};

	exports.default = Home;

/***/ },
/* 30 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});

	var _react = __webpack_require__(4);

	var _react2 = _interopRequireDefault(_react);

	var _ProgressBar = __webpack_require__(31);

	var _ProgressBar2 = _interopRequireDefault(_ProgressBar);

	var _classnames = __webpack_require__(22);

	var _classnames2 = _interopRequireDefault(_classnames);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var ctx = (0, _classnames2.default)(_ProgressBar2.default.root, 'circle-spinner');
	var ProgressBar = function ProgressBar(props) {
		return _react2.default.createElement(
			'div',
			{ className: ctx },
			_react2.default.createElement('i', null)
		);
	};

	exports.default = ProgressBar;

/***/ },
/* 31 */
/***/ function(module, exports) {

	module.exports = {
		"root": "ProgressBar__root-32PKa",
		"r1": "ProgressBar__r1-26Cz0",
		"r2": "ProgressBar__r2-1Ug6d"
	};

/***/ },
/* 32 */
/***/ function(module, exports) {

	module.exports = {
		"container": "Home__container-d8WWG",
		"sys-desc": "Home__sys-desc-2ko8w",
		"func-desc": "Home__func-desc-1SEKs",
		"op-desc": "Home__op-desc-gD_FF",
		"desc-title": "Home__desc-title-21Nrh",
		"desc-content": "Home__desc-content-3TS8Z"
	};

/***/ },
/* 33 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _react = __webpack_require__(4);

	var _react2 = _interopRequireDefault(_react);

	var _reactRedux = __webpack_require__(7);

	var _reactRouter = __webpack_require__(5);

	var _isomorphicFetch = __webpack_require__(19);

	var _isomorphicFetch2 = _interopRequireDefault(_isomorphicFetch);

	var _index = __webpack_require__(34);

	var _ParkingState = __webpack_require__(38);

	var _ParkingState2 = _interopRequireDefault(_ParkingState);

	var _StatePreview = __webpack_require__(50);

	var _StatePreview2 = _interopRequireDefault(_StatePreview);

	var _Tips = __webpack_require__(51);

	var _Tips2 = _interopRequireDefault(_Tips);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var Monitor = function (_Component) {
	  _inherits(Monitor, _Component);

	  function Monitor(props) {
	    _classCallCheck(this, Monitor);

	    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Monitor).call(this, props));

	    _this.handleOrder = _this.handleOrder.bind(_this);
	    return _this;
	  }

	  _createClass(Monitor, [{
	    key: 'handleOrder',


	    // 处理预订车位操作
	    value: function handleOrder(sensorId, target) {
	      // 检测登录状态
	      try {
	        var user = JSON.parse(sessionStorage.getItem('_user'));
	        // 向服务器发送"预定"请求, 同时更新已登录用户的信息
	        if (user == null) {
	          alert('未登录的用户，禁止预定车位操作！');
	          return;
	        }
	        if (user.ordered.vehicleId != null) {
	          var rs = window.confirm('每个用户只允许预定一个车位,是否替换当前预约的车位？');
	          if (rs) {
	            var userid = user._id;
	            target.style.cssText = 'text-decoration: underline';
	            this.props.dispatch((0, _index.userOrder)(sensorId, userid));
	          }
	        } else {
	          var userid = user._id;
	          target.style.cssText = 'text-decoration: underline';
	          this.props.dispatch((0, _index.userOrder)(sensorId, userid));
	        }
	      } catch (err) {
	        alert('请登陆后操作!');
	      }
	    }

	    /**
	     * 根据当前停车场中所有停车位的评分，来获取被预定车位的相似推荐
	     * @param  {[type]} sensors  [description]
	     * @param  {[type]} sensorId [description]
	     * @return {[type]}          [description]
	     */

	  }, {
	    key: 'getRecommendation',
	    value: function getRecommendation(sensors, sensorId) {}
	  }, {
	    key: 'componentDidMount',
	    value: function componentDidMount() {
	      // 获取当前页面停车场的具体信息
	      var _props = this.props;
	      var dispatch = _props.dispatch;
	      var id = _props.params.id;

	      if (id == null || id.length != 24) {
	        return _reactRouter.browserHistory.push('/monitor');
	      }
	      dispatch((0, _index.loadMonitor)(id));

	      // 开启服务器推送监听
	      var mqttClient = __webpack_require__(53);
	      mqttClient.subscribe(id);
	      mqttClient.onReceivedMsg(function (data) {
	        // data{sensorId, status, statusMsg, prevStatusMsg}
	        dispatch((0, _index.receiveUpdateData)(data));
	      });
	    }
	  }, {
	    key: 'render',
	    value: function render() {
	      return _react2.default.createElement(
	        'div',
	        null,
	        _react2.default.createElement(_StatePreview2.default, {
	          vehicle: this.props.vehicle,
	          isFetching: this.props.isFetching.vehicleFetching }),
	        _react2.default.createElement(_ParkingState2.default, {
	          sensors: this.props.sensors,
	          onOrderClick: this.handleOrder,
	          isFetching: this.props.isFetching.orderFetching
	        }),
	        _react2.default.createElement(_Tips2.default, { vehicle: this.props.vehicle })
	      );
	    }
	  }]);

	  return Monitor;
	}(_react.Component);

	Monitor.needs = [_index.loadMonitor];
	exports.default = (0, _reactRedux.connect)(mapStateToProps)(Monitor);


	function mapStateToProps(state, ownProps) {
	  var vehicleId = ownProps.params.id;
	  var vehicleTable = state.entities.vehicles;
	  var sensorTable = state.entities.sensors;

	  var vehicle = vehicleTable[vehicleId] || {}; // 初始化的时候并没有真实的sensor数据只有name和id
	  var sensors = (vehicle.sensors || []).map(function (sensorId) {
	    return sensorTable[sensorId];
	  }) || [];
	  var isFetching = state.isFetching;

	  return {
	    vehicle: vehicle,
	    sensors: sensors,
	    isFetching: isFetching
	  };
	}

/***/ },
/* 34 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.QUERY_RANGE = exports.USER_INFO = exports.ORDERED_FAILURE = exports.ORDERED_RECEIVE = exports.ORDERED_PATCH = exports.RECIEVE_UPDATE_DATA = exports.VEHICLES_FAILURE = exports.VEHICLES_SUCCESS = exports.VEHICLES_REQUEST = exports.MONITOR_FAILURE = exports.MONITOR_SUCCESS = exports.MONITOR_REQUEST = undefined;
	exports.loadMonitor = loadMonitor;
	exports.loadVehicles = loadVehicles;
	exports.receiveUpdateData = receiveUpdateData;
	exports.userOrder = userOrder;
	exports.fetchUserInfo = fetchUserInfo;
	exports.queryRange = queryRange;

	var _api = __webpack_require__(35);

	var _isomorphicFetch = __webpack_require__(19);

	var _isomorphicFetch2 = _interopRequireDefault(_isomorphicFetch);

	var _env = __webpack_require__(20);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

	var MONITOR_REQUEST = exports.MONITOR_REQUEST = 'MONITOR_REQUEST';
	var MONITOR_SUCCESS = exports.MONITOR_SUCCESS = 'MONITOR_SUCCESS';
	var MONITOR_FAILURE = exports.MONITOR_FAILURE = 'MONITOR_FAILURE';

	// redux-thunk
	function fetchMonitor(id) {
	  return _defineProperty({
	    id: id
	  }, _api.CALL_API, {
	    types: [MONITOR_REQUEST, MONITOR_SUCCESS, MONITOR_FAILURE],
	    endpoint: '/api/v1/vehicle/' + id,
	    schema: _api.Schemas.VEHICLE
	  });
	}

	// load the single sensor info from server
	// Relies on api middleware
	function loadMonitor(id) {
	  if (typeof id !== 'string') {
	    console.log('来自服务端的调用, id为:', id['id']);
	  }
	  id = typeof id === 'string' ? id : id['id']; // 服务器端渲染的时候传递的是params对象
	  if (typeof id === 'index.js.map') {
	    return;
	  } // 排除index.js.map
	  return function (dispatch, getState) {
	    // 缓存或者其他判断
	    return dispatch(fetchMonitor(id));
	  };
	}

	var VEHICLES_REQUEST = exports.VEHICLES_REQUEST = 'VEHICLES_REQUEST';
	var VEHICLES_SUCCESS = exports.VEHICLES_SUCCESS = 'VEHICLES_SUCCESS';
	var VEHICLES_FAILURE = exports.VEHICLES_FAILURE = 'VEHICLES_FAILURE';

	function fetchVehicles() {
	  return _defineProperty({}, _api.CALL_API, {
	    types: [VEHICLES_REQUEST, VEHICLES_SUCCESS, VEHICLES_FAILURE],
	    endpoint: '/api/v1/vehicles',
	    schema: _api.Schemas.VEHICLE_ARRAY
	  });
	}
	function loadVehicles() {
	  return function (dispatch, getState) {
	    // // 预处理
	    if (getState().vehicles.ids.length > 0) {
	      return null;
	    }
	    return dispatch(fetchVehicles());
	  };
	}

	var RECIEVE_UPDATE_DATA = exports.RECIEVE_UPDATE_DATA = 'RECIEVE_UPDATE_DATA'; //接收车位(传感器)状态变化的数据
	function receiveUpdateData(data) {
	  return {
	    type: RECIEVE_UPDATE_DATA,
	    data: data
	  };
	}

	var ORDERED_PATCH = exports.ORDERED_PATCH = 'ORDERED_PATCH';
	var ORDERED_RECEIVE = exports.ORDERED_RECEIVE = 'ORDERED_RECEIVE'; // 订单管理：预定或者取消预定
	var ORDERED_FAILURE = exports.ORDERED_FAILURE = 'ORDERED_FAILURE';

	function userOrder(sensorId, userid) {
	  // {id, sensorId, status}
	  return _defineProperty({
	    sensorId: sensorId
	  }, _api.CALL_API, {
	    types: [ORDERED_PATCH, ORDERED_RECEIVE, ORDERED_FAILURE],
	    endpoint: "/api/v1/vehicle/order/" + sensorId + '?userid=' + userid
	  });
	}

	/**
	 * 获取用登录用户的信息
	 * @type {String}
	 */
	var USER_INFO = exports.USER_INFO = 'USER_INFO';
	function userInfo(user) {
	  return {
	    type: USER_INFO,
	    data: user // 成功获取用户登录数据
	  };
	}

	function fetchUserInfo(userId) {
	  userId = typeof userId == 'string' ? userId : userId['id'];
	  var userUrl = _env.C.apiBase + '/userinfo/' + userId;
	  debugger;
	  return function (dispatch, getState) {
	    if (getState().userinfo != null) {
	      return null;
	    }
	    return fetchUser(userUrl, dispatch);
	  };
	}

	function fetchUser(userUrl, dispatch) {
	  debugger;
	  (0, _isomorphicFetch2.default)(userUrl, {
	    method: 'get',
	    cache: 'default'
	  }).then(function (res) {
	    if (res.ok) {
	      return res.json();
	    } else {
	      console.log('获取预定车位信息出错，请仔细检查!');
	      throw new Error('获取预定车位信息出错，请仔细检查!');
	    }
	  }).then(function (json) {
	    console.log('在action中，获取用户登录信息为：' + JSON.stringify(json));
	    if (json != null) {
	      dispatch(userInfo(json));
	    } else {
	      throw new Error('Action中的错误，没有对应的登录用户。');
	    }
	  }).catch(function (err) {
	    console.log('在action中获取用户信息时出错：' + err);
	  });
	}

	var QUERY_RANGE = exports.QUERY_RANGE = 'QUERY_RANGE';
	function range(data) {
	  return {
	    type: QUERY_RANGE,
	    data: data
	  };
	}

	function queryRange(range, location) {
	  return function (dispatch, getState) {
	    if (getState().user.range != null) {
	      return null;
	    }
	    return fetchRange(dispatch, range, location);
	  };
	}

	function fetchRange(dispatch, range, location) {
	  var queryUrl = _env.C.apiBase + '/queryrange';
	  (0, _isomorphicFetch2.default)(queryUrl, {
	    method: 'POST',
	    cache: 'default',
	    headers: {
	      'Content-Type': 'application/json'
	    },
	    body: JSON.stringify({
	      location: location, // 当前位置经纬度
	      range: range // 搜索距离范围
	    })
	  }).then(function (res) {
	    if (res.ok) {
	      return res.json();
	    } else {
	      throw new Error('查询地理位置出错');
	    }
	  }).then(function (json) {
	    dispatch(range(json));
	    // json格式
	    // {
	    //  range:
	    //  near:[{object}]
	    // }
	  }).catch(function (err) {
	    throw new Error('查询地理位置错误为：', err);
	  });
	}

/***/ },
/* 35 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.Schemas = exports.CALL_API = undefined;

	var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; }; // [CALL_API]
	// Schemas
	// 网络请求，数据合并，数据归一化

	var _normalizr = __webpack_require__(36);

	var _isomorphicFetch = __webpack_require__(19);

	var _isomorphicFetch2 = _interopRequireDefault(_isomorphicFetch);

	var _url = __webpack_require__(37);

	var _url2 = _interopRequireDefault(_url);

	var _env = __webpack_require__(20);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var API_ROOT = _env.C.apiBase;

	// 输出api标识
	var CALL_API = exports.CALL_API = Symbol('call api');

	// 输出标准化规则
	var vehicleSchema = new _normalizr.Schema('vehicles', { idAttribute: 'id' });
	var sensorSchema = new _normalizr.Schema('sensors', { idAttribute: 'id' });
	vehicleSchema.define({
	  sensors: (0, _normalizr.arrayOf)(sensorSchema)
	});
	var Schemas = exports.Schemas = {
	  VEHICLE: vehicleSchema,
	  VEHICLE_ARRAY: (0, _normalizr.arrayOf)(vehicleSchema)
	};

	// 定义api中间件

	exports.default = function (store) {
	  return function (next) {
	    return function (action) {

	      // 类型校验
	      var callAPI = action[CALL_API];
	      if (callAPI == null) {
	        return next(action);
	      }
	      var types = callAPI.types;
	      var endpoint = callAPI.endpoint;
	      var _callAPI$method = callAPI.method;
	      var method = _callAPI$method === undefined ? "GET" : _callAPI$method;
	      var data = callAPI.data;
	      var schema = callAPI.schema; //method默认值为GET

	      // 类型验证

	      if (!Array.isArray(types) || types.length != 3) {
	        throw new Error('Expected an array of three action types');
	      }
	      if (!types.every(function (it) {
	        return typeof it === 'string';
	      })) {
	        throw new Error('Expected action types to be strings.');
	      }
	      if (!(typeof endpoint === 'undefined' ? 'undefined' : _typeof(endpoint)) === 'string') {
	        throw new Error('Expected the endpoint to be a string'); // 扩展，可以接受endpoint为函数
	      }
	      // if (!schema){
	      //   throw new Error('Specify one of the exported Schemas.')
	      // }

	      // 逻辑处理
	      function actionWith(data) {
	        var finalAction = Object.assign({}, action, data);
	        delete finalAction[CALL_API];
	        return finalAction;
	      }

	      var _types = _slicedToArray(types, 3);

	      var requestType = _types[0];
	      var successType = _types[1];
	      var failureType = _types[2];

	      next(actionWith({ type: requestType }));
	      callApi(endpoint, method, data, schema).then(function (res) {
	        return next(actionWith({
	          type: successType,
	          res: res
	        }));
	      }).catch(function (err) {
	        return next(actionWith({
	          type: failureType,
	          error: err || 'Something happened in the process of api request!'
	        }));
	      });
	    };
	  };
	};

	// 请求处理过程, 使用同构fetch


	function callApi(endpoint, method, data, schema) {
	  endpoint = endpoint.startsWith(API_ROOT) ? endpoint : _url2.default.resolve(API_ROOT, endpoint);
	  var headers = {
	    'Content-Type': 'application/json',
	    'Accept': 'application/json',
	    'Access-Control-Allow-Origin': '*',
	    'Access-Control-Allow-Methods': '*'
	  };
	  var options = {
	    method: method,
	    mode: 'same-origin',
	    cache: 'default',
	    headers: headers
	  };
	  if (data) {
	    options.body = data;
	  };

	  return (0, _isomorphicFetch2.default)(endpoint, options).then(function (res) {
	    return res.json().then(function (json) {
	      return { res: res, json: json };
	    });
	  }).then(function (_ref) {
	    var res = _ref.res;
	    var json = _ref.json;

	    if (!res.ok || json.error) {
	      return Promise.reject(json);
	    }
	    if (schema) {
	      return (0, _normalizr.normalize)(json, schema);
	    }
	    return json;
	  });
	}

/***/ },
/* 36 */
/***/ function(module, exports) {

	module.exports = require("normalizr");

/***/ },
/* 37 */
/***/ function(module, exports) {

	module.exports = require("url");

/***/ },
/* 38 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

	var _react = __webpack_require__(4);

	var _react2 = _interopRequireDefault(_react);

	var _Tab = __webpack_require__(39);

	var _Tab2 = _interopRequireDefault(_Tab);

	var _ParkingState = __webpack_require__(45);

	var _ParkingState2 = _interopRequireDefault(_ParkingState);

	var _ParkingItem = __webpack_require__(46);

	var _ParkingItem2 = _interopRequireDefault(_ParkingItem);

	var _StateIndicator = __webpack_require__(48);

	var _StateIndicator2 = _interopRequireDefault(_StateIndicator);

	var _ProgressBar = __webpack_require__(30);

	var _ProgressBar2 = _interopRequireDefault(_ProgressBar);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	// 这里通过clearfix向Tab内部添加自定义的样式，按要求覆盖样式。
	var ParkingState = function ParkingState(_ref) {
	  var sensors = _ref.sensors;
	  var _onOrderClick = _ref.onOrderClick;
	  var isFetching = _ref.isFetching;
	  return _react2.default.createElement(
	    'div',
	    { className: _ParkingState2.default.container },
	    _react2.default.createElement(
	      _Tab2.default,
	      { title: '停车分布' },
	      _react2.default.createElement(_StateIndicator2.default, { clazz: _ParkingState2.default.indicator }),
	      isFetching ? _react2.default.createElement(
	        'div',
	        { className: _ParkingState2.default.root },
	        _react2.default.createElement(_ProgressBar2.default, null),
	        _react2.default.createElement('v', { style: { height: _ParkingState2.default.minHeight } })
	      ) : _react2.default.createElement(
	        'div',
	        null,
	        sensors.map(function (sensor, index) {
	          return _react2.default.createElement(
	            'div',
	            { className: _ParkingState2.default.wrapper, key: sensor.id },
	            _react2.default.createElement(_ParkingItem2.default, _extends({}, sensor, { sensorFetching: isFetching, onOrderClick: function onOrderClick(target) {
	                return _onOrderClick(sensor.id, target);
	              } }))
	          );
	        })
	      )
	    )
	  );
	};

	exports.default = ParkingState;

/***/ },
/* 39 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});

	var _react = __webpack_require__(4);

	var _react2 = _interopRequireDefault(_react);

	var _TabTitle = __webpack_require__(40);

	var _TabTitle2 = _interopRequireDefault(_TabTitle);

	var _TabContent = __webpack_require__(42);

	var _TabContent2 = _interopRequireDefault(_TabContent);

	var _Tab = __webpack_require__(44);

	var _Tab2 = _interopRequireDefault(_Tab);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var Tab = function Tab(_ref) {
		var children = _ref.children;
		var title = _ref.title;


		return _react2.default.createElement(
			'div',
			{ className: _Tab2.default.root },
			_react2.default.createElement(
				_TabTitle2.default,
				{ title: title },
				children[0]
			),
			_react2.default.createElement(
				_TabContent2.default,
				null,
				children[1]
			)
		);
	};

	exports.default = Tab;

/***/ },
/* 40 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});

	var _react = __webpack_require__(4);

	var _react2 = _interopRequireDefault(_react);

	var _TabTitle = __webpack_require__(41);

	var _TabTitle2 = _interopRequireDefault(_TabTitle);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var TabTitle = function TabTitle(_ref) {
		var title = _ref.title;
		var children = _ref.children;
		return _react2.default.createElement(
			'div',
			{ className: _TabTitle2.default.root },
			_react2.default.createElement(
				'h2',
				{ className: _TabTitle2.default.desc },
				title
			),
			_react2.default.createElement('div', { className: _TabTitle2.default["title-indicator"] }),
			children
		);
	};

	exports.default = TabTitle;

/***/ },
/* 41 */
/***/ function(module, exports) {

	module.exports = {
		"root": "TabTitle__root-1dplc",
		"desc": "TabTitle__desc-2Bywm",
		"title-indicator": "TabTitle__title-indicator-EHIrv"
	};

/***/ },
/* 42 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});

	var _react = __webpack_require__(4);

	var _react2 = _interopRequireDefault(_react);

	var _TabContent = __webpack_require__(43);

	var _TabContent2 = _interopRequireDefault(_TabContent);

	var _classnames = __webpack_require__(22);

	var _classnames2 = _interopRequireDefault(_classnames);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var TabContent = function TabContent(props) {
		var ctx = (0, _classnames2.default)('clearfix', _TabContent2.default.root); // 清除浮动
		return _react2.default.createElement(
			'div',
			{ className: ctx },
			props.children
		);
	};

	exports.default = TabContent;

/***/ },
/* 43 */
/***/ function(module, exports) {

	module.exports = {
		"root": "TabContent__root-iqB6C"
	};

/***/ },
/* 44 */
/***/ function(module, exports) {

	module.exports = {
		"root": "Tab__root-17ZAJ"
	};

/***/ },
/* 45 */
/***/ function(module, exports) {

	module.exports = {
		"minHeight": "3rem",
		"container": "ParkingState__container-3_fAa",
		"root": "ParkingState__root-1MmCs",
		"wrapper": "ParkingState__wrapper-3nVlM",
		"indicator": "ParkingState__indicator-qOpGw"
	};

/***/ },
/* 46 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _react = __webpack_require__(4);

	var _react2 = _interopRequireDefault(_react);

	var _ParkingItem = __webpack_require__(47);

	var _ParkingItem2 = _interopRequireDefault(_ParkingItem);

	var _classnames = __webpack_require__(22);

	var _classnames2 = _interopRequireDefault(_classnames);

	var _ProgressBar = __webpack_require__(30);

	var _ProgressBar2 = _interopRequireDefault(_ProgressBar);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var ParkingItem = function ParkingItem(_ref) {
	  var id = _ref.id;
	  var pos = _ref.pos;
	  var currentStatus = _ref.currentStatus;
	  var onOrderClick = _ref.onOrderClick;
	  var sensorFetching = _ref.sensorFetching;

	  var statusStyle = void 0;
	  switch (currentStatus) {
	    case 'busy':
	      statusStyle = _ParkingItem2.default.busy;
	      break;
	    case 'ordered':
	      statusStyle = _ParkingItem2.default.ordered;
	      break;
	    case 'idle':
	      statusStyle = _ParkingItem2.default.idle;
	      break;
	    default:
	      break;
	  }
	  var finalStyle = (0, _classnames2.default)(_ParkingItem2.default.root, statusStyle);
	  return _react2.default.createElement(
	    'div',
	    { className: _ParkingItem2.default.extra, onClick: function onClick(e) {
	        if (currentStatus === 'ordered') {
	          alert('无效的操作，该车位已被预订!');
	          e.stopPropagation();
	          return;
	        }
	        if (currentStatus === 'busy') {
	          alert('车位是占用状态，别乱点了！');
	          e.stopPropagation();
	          return;
	        }
	        // 触发车位预定,向服务器请求
	        onOrderClick(e.target);
	      } },
	    _react2.default.createElement(
	      'div',
	      { className: finalStyle },
	      _react2.default.createElement(
	        'div',
	        { style: { display: 'inline-block', width: '100%', verticalAlign: 'middle' } },
	        _react2.default.createElement(
	          'span',
	          null,
	          '#',
	          id.split('_')[1]
	        )
	      ),
	      _react2.default.createElement('i', { style: { display: 'inline-block', height: '100%', verticalAlign: 'middle' } })
	    ),
	    _react2.default.createElement(
	      'div',
	      { className: _ParkingItem2.default.backface },
	      sensorFetching !== undefined && sensorFetching === true ? _react2.default.createElement(_ProgressBar2.default, null) : _react2.default.createElement(
	        'span',
	        null,
	        '点击预订车位'
	      )
	    )
	  );
	}; // 合并样式


	exports.default = ParkingItem;

/***/ },
/* 47 */
/***/ function(module, exports) {

	module.exports = {
		"extra": "ParkingItem__extra-PYmRF",
		"root": "ParkingItem__root-3V4Ag",
		"backface": "ParkingItem__backface-3KKfs",
		"idle": "ParkingItem__idle-1ivjh",
		"busy": "ParkingItem__busy-VSf4x",
		"ordered": "ParkingItem__ordered-TT6_o"
	};

/***/ },
/* 48 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});

	var _react = __webpack_require__(4);

	var _react2 = _interopRequireDefault(_react);

	var _StatePreview = __webpack_require__(49);

	var _StatePreview2 = _interopRequireDefault(_StatePreview);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var StateIndicator = function StateIndicator(_ref) {
		var clazz = _ref.clazz;
		var total = _ref.total;
		var busy = _ref.busy;
		var idle = _ref.idle;
		var ordered = _ref.ordered;
		// 组件内容一样，只是样式不一样。

		return _react2.default.createElement(
			'ul',
			{ className: clazz },
			_react2.default.createElement(
				'li',
				null,
				_react2.default.createElement('i', { className: 'icon-state' }),
				_react2.default.createElement(
					'span',
					null,
					'  总车位:  ',
					total
				)
			),
			_react2.default.createElement(
				'li',
				null,
				_react2.default.createElement('i', { className: 'icon-state bg-red' }),
				_react2.default.createElement(
					'span',
					null,
					'  已占用:  ',
					busy
				)
			),
			_react2.default.createElement(
				'li',
				null,
				_react2.default.createElement('i', { className: 'icon-state bg-blue' }),
				_react2.default.createElement(
					'span',
					null,
					'  已预约:  ',
					ordered
				)
			),
			_react2.default.createElement(
				'li',
				null,
				_react2.default.createElement('i', { className: 'icon-state bg-green' }),
				_react2.default.createElement(
					'span',
					null,
					'  空闲位:  ',
					idle
				)
			)
		);
	};
	exports.default = StateIndicator;

/***/ },
/* 49 */
/***/ function(module, exports) {

	module.exports = {
		"minHeight": "2.34rem",
		"container": "StatePreview__container-3xAFo",
		"root": "StatePreview__root-3gKXN",
		"state-graphic": "StatePreview__state-graphic-MNZZb",
		"state-info": "StatePreview__state-info-jVk_n",
		"state-run": "StatePreview__state-run-1ZRGg",
		"state-title": "StatePreview__state-title-3tF9L",
		"state-content": "StatePreview__state-content-1iG_u",
		"btn-stop": "StatePreview__btn-stop-q5oZf"
	};

/***/ },
/* 50 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _react = __webpack_require__(4);

	var _react2 = _interopRequireDefault(_react);

	var _Tab = __webpack_require__(39);

	var _Tab2 = _interopRequireDefault(_Tab);

	var _StatePreview = __webpack_require__(49);

	var _StatePreview2 = _interopRequireDefault(_StatePreview);

	var _StateIndicator = __webpack_require__(48);

	var _StateIndicator2 = _interopRequireDefault(_StateIndicator);

	var _ProgressBar = __webpack_require__(30);

	var _ProgressBar2 = _interopRequireDefault(_ProgressBar);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var StatePreview = function (_Component) {
	  _inherits(StatePreview, _Component);

	  function StatePreview(props) {
	    _classCallCheck(this, StatePreview);

	    return _possibleConstructorReturn(this, Object.getPrototypeOf(StatePreview).call(this, props));
	  }

	  _createClass(StatePreview, [{
	    key: 'componentDidUpdate',
	    value: function componentDidUpdate() {
	      var vehicle = this.props.vehicle;

	      var canvas = this.canvas;
	      if (!this.props.isFetching) {
	        // 开始绘制饼状图
	        console.log('____________调用绘图');
	        drawCavans(canvas, vehicle);
	      }
	    }
	  }, {
	    key: 'render',
	    value: function render() {
	      var _this2 = this;

	      var _props = this.props;
	      var vehicle = _props.vehicle;
	      var isFetching = _props.isFetching;
	      var id = vehicle.id;
	      var name = vehicle.name;
	      var location = vehicle.location;
	      var total = vehicle.total;
	      var status = vehicle.status;
	      var sensors = vehicle.sensors;

	      var d = new Date();
	      var date = d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate() + '  ' + d.getHours() + ':' + d.getMinutes();
	      return _react2.default.createElement(
	        'div',
	        { className: _StatePreview2.default.container },
	        _react2.default.createElement(
	          _Tab2.default,
	          { title: '状态预览' },
	          _react2.default.createElement('div', null),
	          isFetching ? _react2.default.createElement(
	            'div',
	            { className: _StatePreview2.default.root },
	            _react2.default.createElement(_ProgressBar2.default, null),
	            _react2.default.createElement('v', { style: { height: _StatePreview2.default.minHeight } })
	          ) : _react2.default.createElement(
	            'div',
	            null,
	            _react2.default.createElement(
	              'div',
	              { className: _StatePreview2.default["state-graphic"] },
	              _react2.default.createElement('canvas', { width: '100', height: '100', ref: function ref(node) {
	                  return _this2.canvas = node;
	                } })
	            ),
	            _react2.default.createElement(_StateIndicator2.default, _extends({ clazz: _StatePreview2.default['state-info'], total: total }, status)),
	            _react2.default.createElement(
	              'dl',
	              { className: _StatePreview2.default['state-run'] },
	              _react2.default.createElement(
	                'dt',
	                { className: _StatePreview2.default['state-title'] },
	                '更新于:'
	              ),
	              _react2.default.createElement(
	                'dd',
	                { className: _StatePreview2.default['state-content'] },
	                typeof window == 'undefined' ? '' : date
	              ),
	              _react2.default.createElement('br', null),
	              _react2.default.createElement(
	                'dt',
	                { className: _StatePreview2.default['state-title'] },
	                '经纬度:'
	              ),
	              _react2.default.createElement(
	                'dd',
	                { className: _StatePreview2.default['state-content'] },
	                parseFloat(location[0]).toFixed(3) + ' / ' + parseFloat(location[1]).toFixed(3)
	              ),
	              _react2.default.createElement(
	                'dt',
	                { className: _StatePreview2.default['state-title'] },
	                '当前停车场:'
	              ),
	              _react2.default.createElement(
	                'dd',
	                { className: _StatePreview2.default['state-content'] },
	                name
	              )
	            ),
	            _react2.default.createElement(
	              'button',
	              { className: _StatePreview2.default['btn-stop'] },
	              '停止监控'
	            )
	          )
	        )
	      );
	    }
	  }]);

	  return StatePreview;
	}(_react.Component);

	function drawCavans(canvas, vehicle) {
	  var total = vehicle.total;
	  var _vehicle$status = vehicle.status;
	  var busy = _vehicle$status.busy;
	  var idle = _vehicle$status.idle;
	  var ordered = _vehicle$status.ordered;

	  console.log('busy:', busy, ' idle:', idle, ' ordered:', ordered);
	  var ctx = canvas.getContext('2d');
	  ctx.height = 100;
	  ctx.width = 100;
	  var r = ctx.width / 2;
	  var data = [busy, idle, ordered];
	  var colors = ["red", "#0f0", "#32CDEC"];

	  var startAngle = 0,
	      endAngle = 0;
	  for (var i = 0, len = data.length; i < len; i++) {
	    ctx.beginPath();
	    ctx.moveTo(r, r);
	    endAngle = startAngle + 2 * Math.PI * (data[i] / total);
	    ctx.arc(r, r, r, startAngle, endAngle);
	    startAngle = endAngle;
	    ctx.closePath();

	    ctx.fillStyle = colors[i];
	    ctx.fill();
	  }
	}

	exports.default = StatePreview;

/***/ },
/* 51 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});

	var _react = __webpack_require__(4);

	var _react2 = _interopRequireDefault(_react);

	var _Tips = __webpack_require__(52);

	var _Tips2 = _interopRequireDefault(_Tips);

	var _reactRouter = __webpack_require__(5);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var Tips = function Tips(_ref) {
		var vehicle = _ref.vehicle;
		return _react2.default.createElement(
			'div',
			{ className: _Tips2.default.tips },
			_react2.default.createElement(
				'span',
				null,
				'Tips:'
			),
			_react2.default.createElement(
				'p',
				null,
				'1.鼠标移动至圆圈，可进行车位预约或者查看信息.'
			),
			_react2.default.createElement(
				'p',
				null,
				'2.当没有合适车位时，点击推荐按钮试试吧!'
			),
			_react2.default.createElement(
				'div',
				{ className: _Tips2.default.btn },
				_react2.default.createElement(
					'button',
					{ onClick: function onClick(e) {
							_reactRouter.browserHistory.push('/path?lng=' + vehicle.location[0] + '&lat=' + vehicle.location[1]);
						} },
					'点击查看当前停车场位置'
				)
			)
		);
	};

	exports.default = Tips;

/***/ },
/* 52 */
/***/ function(module, exports) {

	module.exports = {
		"tips": "Tips__tips-2sJuZ",
		"btn": "Tips__btn-2CFyJ"
	};

/***/ },
/* 53 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var mqtt = __webpack_require__(54);
	var client = mqtt.connect('ws://localhost:8081');

	exports.subscribe = function (id) {
		// 订阅传主题为:'传感器变化'的消息。
		client.on('connect', function () {
			console.log('连接mqtt代理成功！当前客户端id为:', client.id);

			client.subscribe('sensor_changed' + id, { qos: 0 }, function () {
				console.log('订阅消息成功，当前订阅的主题消息为:sensor_changed' + id);
			});
		});

		client.on('close', function () {
			console.log('mqtt连接关闭!');
		});
		client.on('reconnect', function () {
			console.log('mqtt重新连接');
		});
		client.on('error', function (e) {
			console.log('mqtt客户端发生错误:', e);
		});
	};

	exports.onReceivedMsg = function (cb) {
		client.on('message', function (topic, message, packet) {
			console.log('接收到消息。消息主题为:' + topic + ',消息主题为:' + message);
			cb(JSON.parse(message));
		});
	};

	exports.publish = function (topic, payload) {
		//client.publish('presence','Hello mqtt') ;
	};

/***/ },
/* 54 */
/***/ function(module, exports) {

	module.exports = require("mqtt");

/***/ },
/* 55 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _react = __webpack_require__(4);

	var _react2 = _interopRequireDefault(_react);

	var _reactRedux = __webpack_require__(7);

	var _index = __webpack_require__(34);

	var _Selector = __webpack_require__(56);

	var _Selector2 = _interopRequireDefault(_Selector);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var VehicleSelector = function (_Component) {
	  _inherits(VehicleSelector, _Component);

	  function VehicleSelector(props) {
	    _classCallCheck(this, VehicleSelector);

	    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(VehicleSelector).call(this, props));

	    _this.componentDidMount = function () {
	      var dispatch = _this.props.dispatch;
	      dispatch((0, _index.loadVehicles)());
	    };

	    return _this;
	  }

	  _createClass(VehicleSelector, [{
	    key: 'render',
	    value: function render() {
	      var _props = this.props;
	      var ids = _props.ids;
	      var names = _props.names;

	      return _react2.default.createElement(_Selector2.default, { ids: ids, names: names });
	    }
	  }]);

	  return VehicleSelector;
	}(_react.Component);

	VehicleSelector.needs = [_index.loadVehicles];
	exports.default = (0, _reactRedux.connect)(mapStateToProps)(VehicleSelector);


	function mapStateToProps(state, ownProps) {
	  var ids = state.vehicles.ids;
	  var vehiclesTable = state.entities.vehicles;
	  var names = ids.map(function (id) {
	    return vehiclesTable[id].name;
	  });
	  return {
	    ids: ids,
	    names: names
	  };
	}

/***/ },
/* 56 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _react = __webpack_require__(4);

	var _react2 = _interopRequireDefault(_react);

	var _Selector = __webpack_require__(57);

	var _Selector2 = _interopRequireDefault(_Selector);

	var _reactRouter = __webpack_require__(5);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function Selector(_ref) {
	  var ids = _ref.ids;
	  var names = _ref.names;

	  return _react2.default.createElement(
	    'ul',
	    { className: _Selector2.default["root"] },
	    ids.map(function (id, index) {
	      return _react2.default.createElement(
	        'li',
	        { className: _Selector2.default["list-item"], key: index },
	        _react2.default.createElement(
	          _reactRouter.Link,
	          { to: '/monitor/' + id, className: _Selector2.default["item-name"] },
	          names[index]
	        ),
	        _react2.default.createElement(
	          'span',
	          { className: _Selector2.default["item-status"] },
	          '运行状态良好'
	        )
	      );
	    })
	  );
	}

	Selector.propTypes = {
	  ids: _react.PropTypes.array.isRequired,
	  names: _react.PropTypes.array.isRequired
	};

	exports.default = Selector;

/***/ },
/* 57 */
/***/ function(module, exports) {

	module.exports = {
		"root": "Selector__root-3Jr0A",
		"list-item": "Selector__list-item-1nLGw",
		"item-name": "Selector__item-name-1fIqq",
		"item-status": "Selector__item-status-1dEcN"
	};

/***/ },
/* 58 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _react = __webpack_require__(4);

	var _react2 = _interopRequireDefault(_react);

	var _Path = __webpack_require__(59);

	var _Path2 = _interopRequireDefault(_Path);

	var _VehicleSelector = __webpack_require__(55);

	var _VehicleSelector2 = _interopRequireDefault(_VehicleSelector);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var Path = function (_Component) {
	  _inherits(Path, _Component);

	  function Path(props) {
	    _classCallCheck(this, Path);

	    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Path).call(this, props));

	    _this.state = {};
	    return _this;
	  }

	  _createClass(Path, [{
	    key: 'componentDidMount',
	    value: function componentDidMount() {
	      var _this2 = this;

	      // 0. 进行当前位置的查询
	      var location = localStorage.getItem('location');
	      var locObj = location == null ? null : JSON.parse(location);
	      var mapObj = location == null ? new AMap.Map('map') : new AMap.Map('map', {
	        center: [locObj.lng, locObj.lat],
	        zoom: 90
	      });
	      debugger;
	      //1. 定位
	      if (locObj != null) {
	        // 2.规划路线
	        // 获取当前位置和目标位置的经纬度
	        var q = this.props.location.query;
	        var destLoc = [parseFloat(q.lat), parseFloat(q.lng)];
	        var srcLoc = [locObj.lng, locObj.lat];
	        plan(mapObj, srcLoc, destLoc);

	        // 3. 标记
	        mark(srcLoc);
	      } else {
	        loc(mapObj, function (locObj) {
	          // 2.规划路线
	          // 获取当前位置和目标位置的经纬度
	          var q = _this2.props.location.query;
	          var destLoc = [parseFloat(q.lat), parseFloat(q.lng)];
	          var srcLoc = [locObj.lng, locObj.lat];
	          plan(mapObj, srcLoc, destLoc);

	          // 3. 标记
	          mark(srcLoc);
	        });
	      }
	    }
	  }, {
	    key: 'render',
	    value: function render() {
	      return _react2.default.createElement(
	        'div',
	        { className: _Path2.default.root },
	        _react2.default.createElement(
	          'div',
	          null,
	          _react2.default.createElement(
	            'span',
	            { id: 'currentLoc' },
	            '当前位置为:xxx, 从右侧选择临近停车场'
	          )
	        ),
	        _react2.default.createElement('div', { id: 'map', className: _Path2.default.map }),
	        _react2.default.createElement(
	          'div',
	          { className: _Path2.default.selector },
	          _react2.default.createElement(_VehicleSelector2.default, null)
	        ),
	        _react2.default.createElement('div', { id: 'result', style: { height: 300, width: 300 } })
	      );
	    }
	  }]);

	  return Path;
	}(_react.Component);

	exports.default = Path;

	// 定位当前位置

	function loc(mapObj, cb) {
	  mapObj.plugin('AMap.Geolocation', function () {
	    var geolocation = new AMap.Geolocation({
	      enableHighAccuracy: true, //是否使用高精度定位，默认:true
	      timeout: 10000, //超过10秒后停止定位，默认：无穷大
	      maximumAge: 0, //定位结果缓存0毫秒，默认：0
	      convert: true, //自动偏移坐标，偏移后的坐标为高德坐标，默认：true
	      showButton: true, //显示定位按钮，默认：true
	      buttonPosition: 'RB', //定位按钮停靠位置，默认：'LB'，左下角
	      buttonOffset: new AMap.Pixel(10, 20), //定位按钮与设置的停靠位置的偏移量，默认：Pixel(10, 20)
	      showMarker: true, //定位成功后在定位到的位置显示点标记，默认：true
	      showCircle: true, //定位成功后用圆圈表示定位精度范围，默认：true
	      panToLocation: true, //定位成功后将定位到的位置作为地图中心点，默认：true
	      zoomToAccuracy: true //定位成功后调整地图视野范围使定位位置及精度范围视野内可见，默认：false
	    });
	    mapObj.addControl(geolocation);
	    AMap.event.addListener(geolocation, 'complete', function (rs) {
	      var position = rs.position;
	      var accuracy = rs.accuracy;
	      var isConverted = rs.isConverted;
	      var info = rs.info;

	      alert(info);
	      // 存储入localstorage
	      var currentLocation = position;
	      localStorage.setItem('location', JSON.stringify(currentLocation));
	      cb(currentLocation);
	    });
	    AMap.event.addListener(geolocation, 'error', function (err) {
	      alert('获取定位错误:' + err.info);
	    });
	  });
	}

	// 路径规划，如果是从监控页面跳入，则会带来目标坐标地址，结合当前坐标地址，得到路径
	// 如果是直接url跳转到来，则需要从右侧选择进入，以获取目的地的坐标

	function plan(mapObj, src, dest) {
	  AMap.service('AMap.Driving', function () {
	    //回调函数
	    var driving = new AMap.Driving({
	      map: mapObj,
	      panel: "result"
	    });

	    debugger;
	    driving.search(src, dest, function (status, result) {
	      //TODO 解析返回结果，自己生成操作界面和地图展示界面
	      alert("定位完成，结果是：" + status);
	    });
	  });
	}

	// 从经纬度到地址， 并标记。
	function mark(lnglatXY) {
	  AMap.service('AMap.Geocoder', function () {
	    //回调函数
	    var geocoder = new AMap.Geocoder({
	      radius: 1000,
	      extensions: "all"
	    });
	    geocoder.getAddress(lnglatXY, function (status, result) {
	      if (status === 'complete' && result.info === 'OK') {
	        geocoder_CallBack(result);
	      }
	    });
	    var marker = new AMap.Marker({ //加点
	      map: map,
	      position: lnglatXY
	    });
	    map.setFitView();
	  });
	}
	function geocoder_CallBack(data) {
	  var address = data.regeocode.formattedAddress; //返回地址描述
	  document.getElementById("currentLoc").innerHTML = '您当前位置为:<br/><font color=\'red\'>' + address + '</font><br/>从右侧选择临近停车场';
	}

/***/ },
/* 59 */
/***/ function(module, exports) {

	module.exports = {
		"root": "Path__root-15Jgs",
		"map": "Path__map-1Los5",
		"selector": "Path__selector-PmuX_"
	};

/***/ },
/* 60 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _react = __webpack_require__(4);

	var _react2 = _interopRequireDefault(_react);

	var _Api = __webpack_require__(61);

	var _Api2 = _interopRequireDefault(_Api);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function Api() {
	  return _react2.default.createElement(
	    'div',
	    { className: _Api2.default.root },
	    _react2.default.createElement(
	      'table',
	      { className: _Api2.default['api-table'] },
	      _react2.default.createElement(
	        'caption',
	        { className: _Api2.default['api-title'] },
	        '标注api参考'
	      ),
	      _react2.default.createElement(
	        'thead',
	        null,
	        _react2.default.createElement(
	          'tr',
	          null,
	          _react2.default.createElement(
	            'th',
	            null,
	            '编号'
	          ),
	          _react2.default.createElement(
	            'th',
	            null,
	            'api'
	          ),
	          _react2.default.createElement(
	            'th',
	            null,
	            '调用方'
	          ),
	          _react2.default.createElement(
	            'th',
	            null,
	            '功能'
	          )
	        )
	      ),
	      _react2.default.createElement(
	        'tbody',
	        null,
	        _react2.default.createElement(
	          'tr',
	          null,
	          _react2.default.createElement(
	            'td',
	            null,
	            '1'
	          ),
	          _react2.default.createElement(
	            'td',
	            null,
	            'POST /api/v1/vehicles'
	          ),
	          _react2.default.createElement(
	            'td',
	            null,
	            '上位机'
	          ),
	          _react2.default.createElement(
	            'td',
	            null,
	            '初始化停车场数据'
	          )
	        ),
	        _react2.default.createElement(
	          'tr',
	          null,
	          _react2.default.createElement(
	            'td',
	            null,
	            '2'
	          ),
	          _react2.default.createElement(
	            'td',
	            null,
	            'PUT /api/v1/vehicles'
	          ),
	          _react2.default.createElement(
	            'td',
	            null,
	            '上位机'
	          ),
	          _react2.default.createElement(
	            'td',
	            null,
	            '提交停车场数据变化'
	          )
	        ),
	        _react2.default.createElement(
	          'tr',
	          null,
	          _react2.default.createElement(
	            'td',
	            null,
	            '3'
	          ),
	          _react2.default.createElement(
	            'td',
	            null,
	            'GET /api/v1/vehicle/:id'
	          ),
	          _react2.default.createElement(
	            'td',
	            null,
	            '客户端'
	          ),
	          _react2.default.createElement(
	            'td',
	            null,
	            '获取特定停车场的具体信息'
	          )
	        ),
	        _react2.default.createElement(
	          'tr',
	          null,
	          _react2.default.createElement(
	            'td',
	            null,
	            '4'
	          ),
	          _react2.default.createElement(
	            'td',
	            null,
	            'GET /vehicle/order/:id'
	          ),
	          _react2.default.createElement(
	            'td',
	            null,
	            '客户端'
	          ),
	          _react2.default.createElement(
	            'td',
	            null,
	            '预定特定车位'
	          )
	        )
	      )
	    )
	  );
	}

	exports.default = Api;

/***/ },
/* 61 */
/***/ function(module, exports) {

	module.exports = {
		"root": "Api__root--89cT",
		"api-title": "Api__api-title-3pmTJ",
		"api-table": "Api__api-table-t3hXv"
	};

/***/ },
/* 62 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _UserCenter = __webpack_require__(63);

	var _UserCenter2 = _interopRequireDefault(_UserCenter);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	exports.default = _UserCenter2.default;

/***/ },
/* 63 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _react = __webpack_require__(4);

	var _react2 = _interopRequireDefault(_react);

	var _reactRedux = __webpack_require__(7);

	var _UserCenter = __webpack_require__(64);

	var _UserCenter2 = _interopRequireDefault(_UserCenter);

	var _reactRouter = __webpack_require__(5);

	var _isomorphicFetch = __webpack_require__(19);

	var _isomorphicFetch2 = _interopRequireDefault(_isomorphicFetch);

	var _env = __webpack_require__(20);

	var _actions = __webpack_require__(34);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var UserCenter = function (_Component) {
		_inherits(UserCenter, _Component);

		function UserCenter(props) {
			_classCallCheck(this, UserCenter);

			var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(UserCenter).call(this, props));

			_this.state = { completed: false };
			return _this;
		}

		_createClass(UserCenter, [{
			key: 'onPlanClick',
			value: function onPlanClick(lng, lat) {
				_reactRouter.browserHistory.push('/path?lng=' + lng + '&lat=' + lat);
			}
		}, {
			key: 'onCancel',
			value: function onCancel(id) {
				//   /vehicle/cancel/:id
				var cancelUrl = _env.C.apiBase + '/vehicle/cancel/' + id; // 这个id是停停车场和车位混合id
				(0, _isomorphicFetch2.default)(cancelUrl, {
					method: 'GET',
					cache: 'default'
				}).then(function (res) {
					if (res.ok) {
						return res.json();
					} else {
						console.log('取消车位预定错误，请仔细检查!');
						throw new Error('取消车位预定错误，请仔细检查!');
					}
				}).then(function (data) {
					alert(data.result == 'ok' ? data.msg : '取消车位错误');
					var user = JSON.parse(sessionStorage.getItem('_user'));
					user.ordered.vehicleId = null;
					sessionStorage.setItem('_user', JSON.stringify(user));
					window.location.reload();
				}).catch(function (err) {
					throw '取消车位时发生错误：', err;
				});
			}
		}, {
			key: 'componentDidMount',
			value: function componentDidMount() {
				// 先从缓存中获取，若没有缓存才重新发送请求
				var cachedUser = sessionStorage.getItem('_user');
				if (cachedUser == null) {
					dispatch((0, _actions.fetchUserInfo)(this.props.params.id));
					location.reload();
				}
			}
		}, {
			key: 'onComplete',
			value: function onComplete() {
				this.setState(function (prevState, prevProps) {
					return Object.assign({}, prevState, {
						completed: true
					});
				});
			}
		}, {
			key: 'queryNear',
			value: function queryNear(range, location) {
				(0, _actions.queryRange)(range, location);
			}
		}, {
			key: 'render',
			value: function render() {
				var _this2 = this;

				/**
	    * 	vehicleId: String,
	   vehicleName: String,
	   location: [String],
	   sensorId: String
	    */
				// 推荐车位功能是从当前停车场中获取相似车位进行推荐
				var username = this.props.user.username;
				var userid = this.props.user._id;
				var nearPoint = this.props.user.nearPoint.near || [];
				var _props$user$ordered = this.props.user.ordered;
				var vehicleId = _props$user$ordered.vehicleId;
				var vehicleName = _props$user$ordered.vehicleName;
				var location = _props$user$ordered.location;
				var sensorId = _props$user$ordered.sensorId;
				var loc = _props$user$ordered.loc;
				// const ordered_sensor = this.props.sensors[vehicleId+'_'+sensorId];
				// if (ordered_sensor!= null && ordered_sensor[currentStatus] != 'ordered') {
				// 	alert('您预订的车位状态发生了变化，请重新选择预订！')
				// }

				var range = 10;
				debugger;
				return _react2.default.createElement(
					'div',
					{ className: _UserCenter2.default["container"] },
					_react2.default.createElement(
						'h3',
						{ className: _UserCenter2.default["user-flag"] },
						_react2.default.createElement(
							'u',
							null,
							username
						),
						'的用户中心'
					),
					_react2.default.createElement(
						'div',
						{ className: _UserCenter2.default["user-orderd"] },
						_react2.default.createElement(
							'h4',
							null,
							'已预订车位'
						),
						_react2.default.createElement('div', { className: _UserCenter2.default["decor"] }),
						_react2.default.createElement(
							'ul',
							{ className: _UserCenter2.default["ordered-info"] },
							_react2.default.createElement(
								'li',
								null,
								'停车场地点: ',
								vehicleName || '未预定车位'
							),
							_react2.default.createElement(
								'li',
								null,
								'车位编号: ',
								sensorId || '未预定车位'
							),
							_react2.default.createElement(
								'li',
								null,
								'车位当前状态: ',
								vehicleName == null ? '未指定' : '已预订'
							),
							_react2.default.createElement(
								'li',
								null,
								_react2.default.createElement(
									'button',
									{ className: _UserCenter2.default["order-op"], onClick: function onClick() {
											return _this2.onPlanClick(location[0], location[1]);
										} },
									'查看路径规划'
								),
								_react2.default.createElement(
									'button',
									{ className: _UserCenter2.default["order-ensure"] },
									'√已预订'
								),
								_react2.default.createElement(
									'button',
									{ className: _UserCenter2.default["order-op"], onClick: function onClick() {
											_this2.onComplete();
										}, style: { background: 'rgb(0,255,0)', color: 'black' } },
									'完成停车'
								),
								_react2.default.createElement(
									'button',
									{ className: _UserCenter2.default["order-cancle"],
										onClick: function onClick(e) {
											_this2.onCancel(vehicleId + '_' + sensorId + '_' + userid);
										},
										disabled: sensorId == null ? true : false,
										style: { background: sensorId == null ? '#ccc' : '#f60', cursor: sensorId == null ? 'not-allowed' : 'pointer' }
									},
									'取消预定'
								)
							)
						),
						_react2.default.createElement(
							'form',
							{ className: _UserCenter2.default["rate-box"], style: { display: this.state.completed ? 'block' : 'none' } },
							_react2.default.createElement(
								'legend',
								null,
								'请对本次停车做出等级评价：'
							),
							_react2.default.createElement(
								'div',
								{ className: _UserCenter2.default["rate-item"] },
								_react2.default.createElement(
									'span',
									null,
									'此次停车是否花费了您大量时间？'
								),
								_react2.default.createElement('input', { name: 'rate1', type: 'radio' }),
								'1 ',
								_react2.default.createElement('input', { name: 'rate1', type: 'radio' }),
								'2 ',
								_react2.default.createElement('input', { name: 'rate1', type: 'radio' }),
								'3 ',
								_react2.default.createElement('input', { name: 'rate1', type: 'radio' }),
								'4 ',
								_react2.default.createElement('input', { name: 'rate1', type: 'radio' }),
								'5 '
							),
							_react2.default.createElement(
								'div',
								{ className: _UserCenter2.default["rate-item"] },
								_react2.default.createElement(
									'span',
									null,
									'当前车位的停车费用是否昂贵？'
								),
								_react2.default.createElement('input', { name: 'rate2', type: 'radio' }),
								'1 ',
								_react2.default.createElement('input', { name: 'rate2', type: 'radio' }),
								'2 ',
								_react2.default.createElement('input', { name: 'rate2', type: 'radio' }),
								'3 ',
								_react2.default.createElement('input', { name: 'rate2', type: 'radio' }),
								'4 ',
								_react2.default.createElement('input', { name: 'rate2', type: 'radio' }),
								'5 '
							),
							_react2.default.createElement(
								'div',
								{ className: _UserCenter2.default["rate-item"] },
								_react2.default.createElement(
									'span',
									null,
									'您觉得当前车位是否更安全？'
								),
								_react2.default.createElement('input', { name: 'rate3', type: 'radio' }),
								'1 ',
								_react2.default.createElement('input', { name: 'rate3', type: 'radio' }),
								'2 ',
								_react2.default.createElement('input', { name: 'rate3', type: 'radio' }),
								'3 ',
								_react2.default.createElement('input', { name: 'rate3', type: 'radio' }),
								'4 ',
								_react2.default.createElement('input', { name: 'rate3', type: 'radio' }),
								'5 '
							),
							_react2.default.createElement(
								'div',
								{ className: _UserCenter2.default["rate-item"] },
								_react2.default.createElement(
									'span',
									null,
									'当前车位距离出口位置是否较远?'
								),
								_react2.default.createElement('input', { name: 'rate4', type: 'radio' }),
								'1 ',
								_react2.default.createElement('input', { name: 'rate4', type: 'radio' }),
								'2 ',
								_react2.default.createElement('input', { name: 'rate4', type: 'radio' }),
								'3 ',
								_react2.default.createElement('input', { name: 'rate4', type: 'radio' }),
								'4 ',
								_react2.default.createElement('input', { name: 'rate4', type: 'radio' }),
								'5 '
							),
							_react2.default.createElement('input', { type: 'submit', value: '提交', className: _UserCenter2.default["btn-rate"] })
						)
					),
					_react2.default.createElement(
						'div',
						{ className: _UserCenter2.default["user-rec"] },
						_react2.default.createElement(
							'h4',
							{ className: _UserCenter2.default["rec-title"] },
							_react2.default.createElement(
								'span',
								{ style: { color: "red" } },
								vehicleName
							),
							'相似停车位推荐'
						),
						_react2.default.createElement('div', { className: _UserCenter2.default["decor"] }),
						_react2.default.createElement(
							'section',
							{ className: _UserCenter2.default["card-container"] },
							new Array(6).fill(1).map(function (item, index) {
								return _react2.default.createElement(
									'ul',
									{ key: index, className: _UserCenter2.default["rec-card"] },
									_react2.default.createElement(
										'li',
										{ className: _UserCenter2.default["card-item"] },
										'车位编号:',
										index
									),
									_react2.default.createElement(
										'li',
										{ className: _UserCenter2.default["card-item"] },
										'车位状态:',
										_react2.default.createElement(
											'i',
											{ className: index % 2 == 0 ? _UserCenter2.default["status-occupy"] : _UserCenter2.default['status-idle'] },
											' '
										),
										'占用'
									),
									_react2.default.createElement(
										'li',
										{ className: _UserCenter2.default["card-item"] },
										_react2.default.createElement(
											'button',
											{ className: _UserCenter2.default["btn"] },
											'预订'
										)
									),
									_react2.default.createElement(
										'li',
										{ className: _UserCenter2.default["card-item"], style: { marginTop: 8 } },
										_react2.default.createElement(
											'button',
											{ className: _UserCenter2.default["btn"] },
											'取消'
										)
									)
								);
							})
						)
					),
					_react2.default.createElement(
						'div',
						{ className: _UserCenter2.default["around-park"] },
						_react2.default.createElement(
							'h4',
							null,
							'周边停车场'
						),
						_react2.default.createElement('br', null),
						_react2.default.createElement('hr', null),
						'查询附近停车场',
						_react2.default.createElement('input', { type: 'number', placeholder: '1',
							ref: function ref(node) {
								range = node.value;
							} }),
						_react2.default.createElement(
							'button',
							{ onClick: function onClick() {
									return _this2.queryNear(range, location);
								},
								className: _UserCenter2.default['order-op'] },
							'查询'
						),
						'(单位：米)',
						_react2.default.createElement('div', { className: _UserCenter2.default["decor"] }),
						_react2.default.createElement(
							'table',
							{ className: _UserCenter2.default["around-table"] },
							_react2.default.createElement(
								'caption',
								null,
								'周边停车场列表'
							),
							_react2.default.createElement(
								'tbody',
								null,
								_react2.default.createElement(
									'tr',
									null,
									_react2.default.createElement(
										'th',
										null,
										'编号'
									),
									_react2.default.createElement(
										'th',
										null,
										'地点'
									),
									_react2.default.createElement(
										'th',
										null,
										'总车位数'
									),
									_react2.default.createElement(
										'th',
										null,
										'空闲位数'
									),
									_react2.default.createElement(
										'th',
										null,
										'操作'
									)
								),
								nearPoint.map(function (point, index) {
									return _react2.default.createElement(
										'tr',
										{ key: index },
										_react2.default.createElement(
											'td',
											null,
											'#',
											index
										),
										_react2.default.createElement(
											'td',
											null,
											'point.name'
										),
										_react2.default.createElement(
											'td',
											null,
											'总车位:',
											point.sensors.length
										),
										_react2.default.createElement(
											'td',
											null,
											'空闲车位:',
											point.sensors.filter(function (sensor, index) {
												return sensor.status == 0;
											}).length
										),
										_react2.default.createElement(
											'td',
											null,
											_react2.default.createElement(
												'button',
												{ className: _UserCenter2.default["btn"] },
												'查看'
											)
										)
									);
								})
							)
						)
					)
				);
			}
		}]);

		return UserCenter;
	}(_react.Component);

	UserCenter.needs = [_actions.fetchUserInfo];


	function mapStateToProps(state) {
		var user = state.user;
		debugger;
		var sensors = state.entities.sensors;
		return {
			user: user,
			sensors: sensors
		};
	}

	exports.default = (0, _reactRedux.connect)(mapStateToProps)(UserCenter);

/***/ },
/* 64 */
/***/ function(module, exports) {

	module.exports = {
		"container": "UserCenter__container-2Ndh1",
		"navbar": "UserCenter__navbar-3kod7",
		"user-flag": "UserCenter__user-flag-28TX0",
		"decor": "UserCenter__decor-3qpuG",
		"user-orderd": "UserCenter__user-orderd-3Z-wO",
		"ordered-info": "UserCenter__ordered-info-AN3RO",
		"order-op": "UserCenter__order-op-3iUct",
		"order-cancle": "UserCenter__order-cancle-21H6g",
		"order-ensure": "UserCenter__order-ensure-BfOka",
		"user-rec": "UserCenter__user-rec-3EfC5",
		"rec-title": "UserCenter__rec-title-2B9F2",
		"card-container": "UserCenter__card-container-YRexJ",
		"rec-card": "UserCenter__rec-card-2rhBF",
		"card-item": "UserCenter__card-item-2g6ZK",
		"around-table": "UserCenter__around-table-Cve2c",
		"btn": "UserCenter__btn-qt1qW",
		"status-occupy": "UserCenter__status-occupy-3HC5I",
		"status-idle": "UserCenter__status-idle-1tYp1",
		"around-park": "UserCenter__around-park-1Hu71",
		"rate-box": "UserCenter__rate-box-2y2-u",
		"rate-item": "UserCenter__rate-item-2LvAs",
		"btn-rate": "UserCenter__btn-rate-1fD3J"
	};

/***/ },
/* 65 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});

	var _redux = __webpack_require__(66);

	var _reduxThunk = __webpack_require__(67);

	var _reduxThunk2 = _interopRequireDefault(_reduxThunk);

	var _reduxLogger = __webpack_require__(68);

	var _reduxLogger2 = _interopRequireDefault(_reduxLogger);

	var _APIMiddleware = __webpack_require__(69);

	var _api = __webpack_require__(35);

	var _api2 = _interopRequireDefault(_api);

	var _index = __webpack_require__(70);

	var _index2 = _interopRequireDefault(_index);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	exports.default = function (initialState) {
		return (0, _redux.createStore)(_index2.default, initialState, (0, _redux.applyMiddleware)(_reduxThunk2.default, _api2.default, typeof window != 'undefined' ? (0, _reduxLogger2.default)() : function (_ref) {
			var dispatch = _ref.dispatch;
			return function (next) {
				return function (action) {
					return next(action);
				};
			};
		}));
	};

/***/ },
/* 66 */
/***/ function(module, exports) {

	module.exports = require("redux");

/***/ },
/* 67 */
/***/ function(module, exports) {

	module.exports = require("redux-thunk");

/***/ },
/* 68 */
/***/ function(module, exports) {

	module.exports = require("redux-logger");

/***/ },
/* 69 */
/***/ function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});

	var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

	var callAPIMiddleware = exports.callAPIMiddleware = function callAPIMiddleware(_ref) {
		var dispatch = _ref.dispatch;
		var getState = _ref.getState;
		return function (next) {
			return function (action) {
				// 1.抽参数
				var types = action.types;
				var payload = action.payload;
				var _action$shouldCallAPI = action.shouldCallAPI;
				var shouldCallAPI = _action$shouldCallAPI === undefined ? function () {
					return true;
				} : _action$shouldCallAPI;
				var // 解构的时候可以添加默认值
				API = action.API;

				//2. 过滤类型

				if (!types) return next(action); //放行,必须return

				if (!Array.isArray(types) || types.length != 3 || types.some(function (it) {
					return typeof it != "string";
				})) {
					throw Error('Expected an array of three string types');
				}
				var requestUrl = payload.requestUrl;

				if (!requestUrl || typeof requestUrl != 'string') {
					throw Error('Expected an string of valid url');
				}
				if (typeof API != 'function') {
					throw new Error('Expected fetch to be a function.');
				}

				if (!shouldCallAPI(getState())) return;

				//3.开始异步调用，并生成同步action实例触发动作

				var _types = _slicedToArray(types, 3);

				var requestType = _types[0];
				var successType = _types[1];
				var errorType = _types[2];

				// 发送api请求之前触发的动作

				dispatch(Object.assign({}, payload, {
					type: requestType
				}));

				return API().then(function (res) {
					if (res.ok) {
						return res.json().then(function (json) {
							// 内部还是一个promise，需要返回给下一个表示等待，否则，下一个是不等待这个内部的promise完成的
							dispatch(Object.assign({}, payload, {
								type: successType,
								json: json
							}));
						});
					} else {
						console.log("Looks like the response wasn't perfect, got status", res.status);
						return res.status;
					}
				}, function (error) {
					dispatch(Object.assign({}, payload, {
						type: errorType,
						error: error
					}));
					return error;
				});
			};
		};
	};

/***/ },
/* 70 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _redux = __webpack_require__(66);

	var _index = __webpack_require__(34);

	var ActionTypes = _interopRequireWildcard(_index);

	var _vehicles = __webpack_require__(71);

	var _vehicles2 = _interopRequireDefault(_vehicles);

	var _entities = __webpack_require__(72);

	var _entities2 = _interopRequireDefault(_entities);

	var _isFetching = __webpack_require__(73);

	var _isFetching2 = _interopRequireDefault(_isFetching);

	var _user = __webpack_require__(74);

	var _user2 = _interopRequireDefault(_user);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

	// 全局错误处理
	function errorMessage() {
	  var state = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];
	  var action = arguments[1];

	  if (action.error) {
	    return action.error;
	  }
	  return state;
	}

	exports.default = (0, _redux.combineReducers)({
	  vehicles: _vehicles2.default,
	  entities: _entities2.default,
	  isFetching: _isFetching2.default,
	  errorMessage: errorMessage,
	  user: _user2.default
	});

/***/ },
/* 71 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _lodash = __webpack_require__(27);

	var _index = __webpack_require__(34);

	var ActionTypes = _interopRequireWildcard(_index);

	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

	//VEHICLES_REQUEST
	//VEHICLES_SUCCESS
	//VEHICLES_FAILURE

	var initialState = { ids: [], isFetching: false };

	function vehicles() {
	  var state = arguments.length <= 0 || arguments[0] === undefined ? initialState : arguments[0];
	  var action = arguments[1];

	  switch (action.type) {
	    case ActionTypes.VEHICLES_REQUEST:
	      return (0, _lodash.merge)({}, state, {
	        fetching: true
	      });

	    case ActionTypes.VEHICLES_SUCCESS:
	      return (0, _lodash.merge)({}, state, {
	        fetching: false,
	        ids: (0, _lodash.union)(state.ids, action.res.result)
	      });

	    case ActionTypes.VEHICLES_FAILURE:
	      return (0, _lodash.merge)({}, state, {
	        fetching: false
	      });

	    default:
	      return state;
	  }
	}

	exports.default = vehicles;

/***/ },
/* 72 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.default = entities;

	var _lodash = __webpack_require__(27);

	var _index = __webpack_require__(34);

	var ActionTypes = _interopRequireWildcard(_index);

	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

	function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

	var initialState = {
	  vehicles: {},
	  sensors: {}
	};

	// 实体数据库的特点是: 结构相同，每次仅仅只是合并变化，
	// 因此，可以直接进行全局处理
	// 实体的整体部分统一处理，部分跟新个别处理
	function entities() {
	  var state = arguments.length <= 0 || arguments[0] === undefined ? initialState : arguments[0];
	  var action = arguments[1];

	  if (action.res && action.res.entities) {
	    return (0, _lodash.merge)({}, state, action.res.entities);
	  } else {
	    return {
	      vehicles: vehicles(state.vehicles, action),
	      sensors: sensors(state.sensors, action)
	    };
	  }
	}

	// function order(state, action){
	//   switch(action.type){
	//     case ActionTypes.ORDERED_PATCH:
	//     case ActionTypes.ORDERED_FAILURE:
	//       return state;
	//     case ActionTypes.ORDERED_RECEIVE: // 返回ok
	//       //return state; 预定成功
	//       const vehicleId = action.sensorId.split('_')[0];
	//       return merge({}, state[vehicleId], {
	//         status: {
	//           idle: state[vehicleId].idle -1,
	//           ordered: state[vehicleId].ordered + 1
	//         }
	//       })
	//   }
	// }

	function vehicles() {
	  var _status;

	  var state = arguments.length <= 0 || arguments[0] === undefined ? initialState.vehicles : arguments[0];
	  var action = arguments[1];

	  switch (action.type) {
	    case ActionTypes.ORDERED_RECEIVE:
	      var vehicleId = action.sensorId.split('_')[0];

	      // 同一个车位就不要多次变化了
	      debugger;
	      return (0, _lodash.merge)({}, state, _defineProperty({}, vehicleId, (0, _lodash.merge)({}, state[vehicleId], {
	        status: {
	          idle: state[vehicleId].status.idle - 1,
	          ordered: state[vehicleId].status.ordered + 1
	        }
	      })));

	    case ActionTypes.RECIEVE_UPDATE_DATA:
	      // 来自服务器的数据推送
	      var _action$data = action.data;
	      var sensorId = _action$data.sensorId;
	      var status = _action$data.status;
	      var statusMsg = _action$data.statusMsg;
	      var prevStatusMsg = _action$data.prevStatusMsg;

	      var vehicleId = sensorId.split('_')[0];
	      if (statusMsg == prevStatusMsg) {
	        // 两次状态相同则不更新。
	        return state;
	      }
	      return (0, _lodash.merge)({}, state, _defineProperty({}, vehicleId, (0, _lodash.merge)({}, state[vehicleId], {
	        status: (_status = {}, _defineProperty(_status, prevStatusMsg, state[vehicleId].status[prevStatusMsg] - 1), _defineProperty(_status, statusMsg, state[vehicleId].status[statusMsg] + 1), _status)
	      })));

	    default:
	      return state;
	  }
	}

	function sensors() {
	  var state = arguments.length <= 0 || arguments[0] === undefined ? initialState.sensors : arguments[0];
	  var action = arguments[1];

	  switch (action.type) {
	    case ActionTypes.ORDERED_RECEIVE:
	      var sensorId = action.sensorId;
	      return (0, _lodash.merge)({}, state, _defineProperty({}, sensorId, (0, _lodash.merge)({}, state[sensorId], {
	        currentStatus: 'ordered'
	      })));

	    case ActionTypes.RECIEVE_UPDATE_DATA:
	      var _action$data2 = action.data;
	      var sensorId = _action$data2.sensorId;
	      var status = _action$data2.status;
	      var statusMsg = _action$data2.statusMsg;
	      var prevStatusMsg = _action$data2.prevStatusMsg;

	      return (0, _lodash.merge)({}, state, _defineProperty({}, sensorId, (0, _lodash.merge)({}, state[sensorId], {
	        currentStatus: statusMsg
	      })));

	    default:
	      return state;
	  }
	}

/***/ },
/* 73 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _index = __webpack_require__(34);

	var ActionTypes = _interopRequireWildcard(_index);

	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

	var initialState = {
	  vehicleFetching: true,
	  orderFetching: false
	};
	/**
	MONITOR_REQUEST
	MONITOR_SUCCESS
	MONITOR_FAILURE
	 */
	function vehicleFetching() {
	  var state = arguments.length <= 0 || arguments[0] === undefined ? initialState.vehicleFetching : arguments[0];
	  var action = arguments[1];

	  switch (action.type) {
	    case ActionTypes.MONITOR_REQUEST:
	      return true;
	    case ActionTypes.MONITOR_SUCCESS:
	    case ActionTypes.MONITOR_FAILURE:
	      return false;
	    default:
	      return state;
	  }
	}

	/* ORDERED_PATCH
	ORDERED_RECEIVE
	ORDERED_FAILURE */
	function orderFetching() {
	  var state = arguments.length <= 0 || arguments[0] === undefined ? initialState.orderFetching : arguments[0];
	  var action = arguments[1];

	  switch (action.type) {
	    case ActionTypes.ORDERED_PATCH:
	      return true;
	    case ActionTypes.ORDERED_RECEIVE:
	    case ActionTypes.ORDERED_FAILURE:
	      return false;
	    default:
	      return state;
	  }
	}

	exports.default = function () {
	  var state = arguments.length <= 0 || arguments[0] === undefined ? initialState : arguments[0];
	  var action = arguments[1];
	  return {
	    vehicleFetching: vehicleFetching(state.vehicleFetching, action),
	    orderFetching: orderFetching(state.orderFetching, action)
	  };
	};

/***/ },
/* 74 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});

	var _lodash = __webpack_require__(27);

	var _index = __webpack_require__(34);

	var ActionTypes = _interopRequireWildcard(_index);

	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

	/**
	 * 处理当前登录用户
	 */


	var initialState = {
		username: '初始值',
		loc: [],
		// 以下都是预定信息
		ordered: {
			vehicleId: "初始值",
			vehicleName: "初始值",
			location: ['0'],
			sensorId: '初始值'
		},
		nearPoint: { range: 0, near: [] }
	};

	function user() {
		var state = arguments.length <= 0 || arguments[0] === undefined ? initialState : arguments[0];
		var action = arguments[1];

		switch (action.type) {
			case ActionTypes.USER_INFO:
				console.log('执行了user的reducer');
				var user = action.data;
				delete user.password;
				var tmp = (0, _lodash.merge)({}, state, user);
				console.log('合并后的user为:' + JSON.stringify(tmp));
				return tmp;
			case ActionTypes.QUERY_RANGE:
				var nearPoint = action.data;
				var newData = (0, _lodash.merge)({}, state, {
					nearPoint: nearPoint
				});
				debugger;
				return newData;
			default:
				return state;
		}
	}

	exports.default = user;

/***/ },
/* 75 */
/***/ function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
		value: true
	});

	exports.default = function (appHtml, initialState) {
		return "\n\t<!DOCTYPE html>\n\t<html lang=\"zh\">\n\t<head>\n\t    <!-- META 一般设置 -->\n\t    <meta charset=\"UTF-8\">\n\t    <meta http-equiv=\"Content-Type\" content=\"text/html;charset=UTF-8\">\n\t    <meta name=\"viewport\" content=\"width=device-width,initial-scale=1,maximun-scale=1,user-scalable=no\" >\n\t    <!--设置IE浏览器有限使用edge渲染 -->\n\t    <meta http-equiv=\"X-UA-Compatible\" content=\"IE=edge,chrome=1\">\n\t    <meta name=\"HandheldFriendly\" content=\"true\">\n\t    <title>车位监控系统</title>\n\n\t    <!-- link优化 -->\n\t    <link rel=\"shortcut icon\" href=\"/static/favicon.ico\">\n\t    <link rel=\"icon\" href=\"/static/favicon.ico\">\n\t    <link href=\"/static/dist/common.css\" rel = 'stylesheet'/>\n\t\t\t<link href=\"/static/dist/module.css\" rel = 'stylesheet'/>\n\n\t    <!-- 国内双核浏览器，特别是360，使用渲染引擎从左到右 -->\n\t    <meta name=\"renderer\" content=\"webkit|ie-comp|ie-stand\">\n\t    <!-- seo优化 -->\n\t    <meta name=\"author\" content=\"\">\n\t    <meta name=\"keywords\" content=\"\">\n\n\t    <!-- html shim -->\n\t    <!--[if lt IE 9]>\n\t      <script src=\"http://cdn.bootcss.com/html5shiv/3.7.2/html5shiv.min.js\"></script>\n\t    <![endif]-->\n\t    <script src=\"http://cdn.bootcss.com/es5-shim/4.5.8/es5-shim.min.js\"></script>\n\t    <script src=\"/static/scripts/browserMqtt.js\"></script>\n\t    <script type=\"text/javascript\" src=\"http://webapi.amap.com/maps?v=1.3&key=f4431845cb5ded19801ecbb0885c9d30\"></script>\n\t</head>\n\t<body>\n\t    <div id=\"react-app\">" + appHtml + "</div>\n\t    <script>\n\t\t\t\twindow.__INITIAL_STATE__ = " + JSON.stringify(initialState) + "\n\t    </script>\n\t    <script src='/static/dist/vendor.js'></script>\n\t    <script src='/static/dist/bundle.js'></script>\n\t</body>\n\t</html>\n";
	};

/***/ },
/* 76 */
/***/ function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});

	exports.default = function (dispatch, components, params) {
		console.log('服务器端加载的组件是:', components);

		var needs = components.reduce(function (prev, current) {
			return (current.needs || []).
			// .concat((current.WrappedComponent ? current.WrappedComponent.needs : []) || []) //组件上的static属性会映射到包装他的高阶组件上去
			concat(prev);
		}, []);

		console.log('-----------------fetchDependentData中----------------');
		console.log('服务端渲染，额外的请求:', needs);
		var promises = needs.map(function (need) {
			return dispatch(need(params));
		}); // 备注二：要求该actionCreator返回promise类型
		return Promise.all(promises);
	};

/***/ },
/* 77 */
/***/ function(module, exports) {

	module.exports = require("webpack");

/***/ },
/* 78 */
/***/ function(module, exports) {

	module.exports = require("webpack-hot-middleware");

/***/ },
/* 79 */
/***/ function(module, exports) {

	module.exports = require("webpack-dev-middleware");

/***/ },
/* 80 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(__dirname) {'use strict';

	var path = __webpack_require__(2);
	var HtmlwebpackPlugin = __webpack_require__(81);
	var webpack = __webpack_require__(77);
	var autoprefixer = __webpack_require__(82);

	var ROOT_PATH = path.normalize(__dirname + '/../..');
	var APP_PATH = path.resolve(ROOT_PATH, 'fe/src/');
	var BUILD_PATH = path.resolve(ROOT_PATH, 'resources/static/dist');
	var RESOURCE_PATH = path.resolve(ROOT_PATH, 'resources/static/');

	var ExtractTextPlugin = __webpack_require__(83); // 分离css文件
	var commonStyleExtract = new ExtractTextPlugin("common.css"); //{ allChunks: true}默认选项,全局css打包插件配置
	var moduleStyleExtract = new ExtractTextPlugin('module.css'); // 模块css打包插件配置
	// ExtractTextPlugin.extract(loaders)只有一个要打包的就直接使用这个函数包裹loader，否则就像上面那样配置。

	module.exports = {
		name: 'client',
		target: 'web',
		entry: [path.resolve(APP_PATH, 'client.js'), 'webpack-hot-middleware/client'],
		output: {
			path: BUILD_PATH,
			filename: 'bundle.js', // 这里加入[hash]表示使用hash来防止js文件缓存
			publicPath: '/static/dist' //配合服务器设置静态资源路径
		},
		plugins: [new webpack.optimize.UglifyJsPlugin({ minimize: true }), new webpack.HotModuleReplacementPlugin(), new webpack.optimize.CommonsChunkPlugin( /*chunkname*/"vendor", /*filename*/"vendor.js"), commonStyleExtract, moduleStyleExtract],
		devtool: 'eval-source-map',
		resovle: {
			extensions: ['', '.js', '.jsx'] //必须先写''否则会找index.js.js和index.js.jsx
		},
		externals: { 'mqtt': 'mqtt' },

		postcss: function postcss() {
			return [__webpack_require__(82), __webpack_require__(84)];
		}
		// postcss: [ autoprefixer({ browsers: ['last 2 versions'] }) ]

		, module: {
			noParse: [],
			loaders: [{
				test: /\.scss$/,
				loader: commonStyleExtract.extract('style', ['css?sourceMap&-minimize', 'postcss', 'sass?sourceMap']),
				include: path.resolve(RESOURCE_PATH, 'styles/') // 表示这里放了公共的全局的样式
			}, {
				test: /\.scss$/,
				exclude: path.resolve(RESOURCE_PATH, 'styles/'), // 公共样式之外的，都是用css-modules进行管理
				loader: moduleStyleExtract.extract('style', ['css?modules&importLoaders=1&localIdentName=[name]__[local]-[hash:base64:5]', 'postcss', 'sass?sourceMap'])
			}, {
				test: /\.(gif|jpg|png)\??.*$/, loader: 'url-loader?limit=50000&name=images/[name].[ext]'
			}, {
				test: /\.(woff|svg|eot|ttf)\??.*$/, loader: 'url-loader?limit=50000&name=fonts/[name].[ext]'
			}, {
				test: /\.(js|jsx)$/,
				loader: 'babel',
				include: APP_PATH,
				exclude: /node_modules/
			}]
		}
	};
	/* WEBPACK VAR INJECTION */}.call(exports, "fe\\build"))

/***/ },
/* 81 */
/***/ function(module, exports) {

	module.exports = require("html-webpack-plugin");

/***/ },
/* 82 */
/***/ function(module, exports) {

	module.exports = require("autoprefixer");

/***/ },
/* 83 */
/***/ function(module, exports) {

	module.exports = require("extract-text-webpack-plugin");

/***/ },
/* 84 */
/***/ function(module, exports) {

	module.exports = require("precss");

/***/ },
/* 85 */
/***/ function(module, exports) {

	module.exports = require("http");

/***/ },
/* 86 */
/***/ function(module, exports) {

	module.exports = require("socket.io");

/***/ }
/******/ ]);