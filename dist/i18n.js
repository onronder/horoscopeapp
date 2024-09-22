"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const i18next_1 = __importDefault(require("i18next"));
const react_i18next_1 = require("react-i18next");
const i18next_fs_backend_1 = __importDefault(require("i18next-fs-backend"));
const i18next_http_middleware_1 = __importDefault(require("i18next-http-middleware"));
const path_1 = __importDefault(require("path"));
i18next_1.default
    .use(i18next_fs_backend_1.default)
    .use(i18next_http_middleware_1.default.LanguageDetector)
    .use(react_i18next_1.initReactI18next)
    .init({
    fallbackLng: 'en',
    backend: {
        loadPath: path_1.default.join(__dirname, '../locales/{{lng}}/{{ns}}.json'),
    },
    debug: false,
    interpolation: {
        escapeValue: false,
    },
});
exports.default = i18next_1.default;
