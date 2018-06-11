"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
var graphql_compose_1 = require("graphql-compose");
var lodash_1 = require("lodash");
var User_1 = require("./schema/User");
var Tags_1 = require("./schema/Tags");
var validToken = function (_a) {
    var context = _a.context;
    return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_b) {
            if (!context.jwt.valid)
                throw new Error('You must provide valid token');
            return [2 /*return*/];
        });
    });
};
var isSelf = function (models) { return function (_a) {
    var args = _a.args, context = _a.context;
    return __awaiter(_this, void 0, void 0, function () {
        var _id, egoId;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _id = args._id || args.record._id;
                    return [4 /*yield*/, models.User.findOne({ _id: _id }).then(function (user) { return user.egoId; })];
                case 1:
                    egoId = _b.sent();
                    if (args.record && args.record.egoId !== egoId) {
                        throw new Error("You can't change your ego id");
                    }
                    else if ("" + egoId !== "" + context.jwt.sub) {
                        throw new Error("You can't edit someone elses profile");
                    }
                    return [2 /*return*/];
            }
        });
    });
}; };
var isAdmin = function (_a) {
    var jwt = _a.context.jwt;
    return __awaiter(_this, void 0, void 0, function () {
        var roles;
        return __generator(this, function (_b) {
            roles = lodash_1.get(jwt, 'context.user.roles') || [];
            if (!roles.includes('ADMIN')) {
                throw new Error('Access denied. You need Admin privileges to access this resource');
            }
            return [2 /*return*/];
        });
    });
};
var restrict = function (resolver) {
    var restrictions = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        restrictions[_i - 1] = arguments[_i];
    }
    return resolver.wrapResolve(function (next) { return function (rp) { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, Promise.all(restrictions.map(function (r) { return r(rp); }))];
                case 1:
                    _a.sent();
                    return [2 /*return*/, next(rp)];
            }
        });
    }); }; });
};
var createSchema = function (_a) {
    var models = _a.models, tags = _a.tags;
    var UserTC = User_1.default(models.User);
    var TagsTC = Tags_1.default({ models: models, tags: tags });
    graphql_compose_1.GQC.rootQuery().addFields({
        self: restrict(UserTC.getResolver('self'), validToken),
        user: restrict(UserTC.getResolver('findById'), isAdmin),
        users: restrict(UserTC.getResolver('pagination'), isAdmin),
        tags: TagsTC.getResolver('listAll'),
    });
    graphql_compose_1.GQC.rootMutation().addFields({
        userCreate: restrict(UserTC.getResolver('createOne'), validToken),
        userRemove: restrict(UserTC.getResolver('removeById'), validToken, isAdmin),
        userUpdate: restrict(UserTC.getResolver('updateById'), validToken, isSelf(models)),
    });
    return graphql_compose_1.GQC.buildSchema();
};
exports.default = createSchema;
//# sourceMappingURL=index.js.map