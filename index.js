const _ = require('lodash');
const express = require('express');
const app = express();
const port = 3030;

var routing = function (routeMixin, routeApiMixin) {
    let Container, Http, JsonHttp, getHttp, getJsonHttp;
    let wrapperMixin, jsonWrapperMixin;

    //型
    Container = function (app) {
        this._app = app;
        this.boot = function () {
            this.get = this.wrapper("get")
            this.post = this.wrapper("post");

            return this;
        }
    }

    Http = function (app) {
        Container.call(this, app);
        this.route_prefix = ""
    }

    JsonHttp = function (app) {
        Container.call(this, app);
        this.route_prefix = "/api"
    }

    getHttp = function (app) {
        return new Http(app);
    }

    getJsonHttp = function (app) {
        return new JsonHttp(app);
    }

    //追加機能
    wrapperMixin = (function(){
        const wrapper = _.curry(function (method, route, func) {
            route = this.route_prefix + route;
            return this._app[method](route, (req, res) => {
                var result = func();
                res.send(result);
            })
        });

        return {
            wrapper: wrapper,
        }
    }());

    //apiリクエスト用の処理ラッパー
    jsonWrapperMixin = (function(){
 

        const wrapper = _.curry(function (method, route, func) {
            route = this.route_prefix + route;
            return this._app[method](route, (req, res) => {
                var result = func();

                res.status(200);
                res.json({
                  status: 200,
                  response: 'result',
                  messages: result
                });
            })
        });
        return {
            wrapper: wrapper,
        }
    }());


////////////////////////////////////////////////
    
    _.extend(Http.prototype, wrapperMixin, routeMixin);
    _.extend(JsonHttp.prototype, jsonWrapperMixin, routeApiMixin);

    getHttp(app).boot().setRoute();
    getJsonHttp(app).boot().setRoute();

}

// 普通のルーティング
var routeMixin = (function(){
    const hello = function (text) {
        var message = text;
        return function () {
            var funcs = [
                function(){message += "Hello"},
                function(){message += " "},
                function(){message += "World"},
            ];
    
            _.forEach(funcs, function(func){
                func();
            })
    
            return message;
        }
    }
    return {
        setRoute: function () {
            this.get("/", hello("Hei! "));
            this.get("/test", hello("Come on! "));
        }
    }
}());

//　API用のルーティング
var routeApiMixin = (function(){
    const hello = function (text) {
        var message = text;
        return function () {
            var funcs = [
                function(){message += "Hello"},
                function(){message += " "},
                function(){message += "World"},
            ];
    
            _.forEach(funcs, function(func){
                func();
            })
    
            return message;
        }
    }

    return {
        setRoute: function () {
            this.get("/", hello("api/ Hei! "));
            this.get("/test", hello("api/ Come on! "));
            this.get("/get", hello("api/ Come on! "));
        }
    }
}());

routing(routeMixin, routeApiMixin)
app.listen(port, () => {
  console.log(`listening at http://localhost:${port}`)
});