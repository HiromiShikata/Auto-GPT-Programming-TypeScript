"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SystemDateTimeRepository = void 0;
const dayjs_1 = __importDefault(require("dayjs"));
class SystemDateTimeRepository {
    constructor() {
        this.now = () => {
            return new Date();
        };
        this.yyyyMMddHHmm = () => {
            return (0, dayjs_1.default)().format('YYYYMMDD-HHmm');
        };
    }
}
exports.SystemDateTimeRepository = SystemDateTimeRepository;
//# sourceMappingURL=SystemDateTimeRepository.js.map