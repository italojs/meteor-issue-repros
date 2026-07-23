Package["core-runtime"].queue("base64",function () {/* Imports */
var Meteor = Package.meteor.Meteor;
var global = Package.meteor.global;
var meteorEnv = Package.meteor.meteorEnv;
var EmitterPromise = Package.meteor.EmitterPromise;
var ECMAScript = Package.ecmascript.ECMAScript;
var meteorInstall = Package.modules.meteorInstall;
var Promise = Package.promise.Promise;

/* Package-scope variables */
var Base64;

var require = meteorInstall({"node_modules":{"meteor":{"base64":{"base64.js":function module(require,exports,module){

////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                        //
// packages/base64/base64.js                                                              //
//                                                                                        //
////////////////////////////////////////////////////////////////////////////////////////////
                                                                                          //
module.export({Base64:()=>Base64},true);// Base 64 encoding
const BASE_64_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
const BASE_64_VALS = Object.create(null);
const getChar = (val)=>BASE_64_CHARS.charAt(val);
const getVal = (ch)=>ch === "=" ? -1 : BASE_64_VALS[ch];
for(let i = 0; i < BASE_64_CHARS.length; i++){
    BASE_64_VALS[getChar(i)] = i;
}
const encode = (array)=>{
    if (typeof array === "string") {
        const str = array;
        array = newBinary(str.length);
        for(let i = 0; i < str.length; i++){
            const ch = str.charCodeAt(i);
            if (ch > 0xff) {
                throw new Error("Not ascii. Base64.encode can only take ascii strings.");
            }
            array[i] = ch;
        }
    }
    const answer = [];
    let a = null;
    let b = null;
    let c = null;
    let d = null;
    for(let i = 0; i < array.length; i++){
        switch(i % 3){
            case 0:
                a = array[i] >> 2 & 0x3f;
                b = (array[i] & 0x03) << 4;
                break;
            case 1:
                b = b | array[i] >> 4 & 0xf;
                c = (array[i] & 0xf) << 2;
                break;
            case 2:
                c = c | array[i] >> 6 & 0x03;
                d = array[i] & 0x3f;
                answer.push(getChar(a));
                answer.push(getChar(b));
                answer.push(getChar(c));
                answer.push(getChar(d));
                a = null;
                b = null;
                c = null;
                d = null;
                break;
        }
    }
    if (a != null) {
        answer.push(getChar(a));
        answer.push(getChar(b));
        if (c == null) {
            answer.push("=");
        } else {
            answer.push(getChar(c));
        }
        if (d == null) {
            answer.push("=");
        }
    }
    return answer.join("");
};
// XXX This is a weird place for this to live, but it's used both by
// this package and 'ejson', and we can't put it in 'ejson' without
// introducing a circular dependency. It should probably be in its own
// package or as a helper in a package that both 'base64' and 'ejson'
// use.
const newBinary = (len)=>{
    if (typeof Uint8Array === "undefined" || typeof ArrayBuffer === "undefined") {
        const ret = [];
        for(let i = 0; i < len; i++){
            ret.push(0);
        }
        ret.$Uint8ArrayPolyfill = true;
        return ret;
    }
    return new Uint8Array(new ArrayBuffer(len));
};
const decode = (str)=>{
    let len = Math.floor(str.length * 3 / 4);
    if (str.charAt(str.length - 1) == "=") {
        len--;
        if (str.charAt(str.length - 2) == "=") {
            len--;
        }
    }
    const arr = newBinary(len);
    let one = null;
    let two = null;
    let three = null;
    let j = 0;
    for(let i = 0; i < str.length; i++){
        const c = str.charAt(i);
        const v = getVal(c);
        switch(i % 4){
            case 0:
                if (v < 0) {
                    throw new Error("invalid base64 string");
                }
                one = v << 2;
                break;
            case 1:
                if (v < 0) {
                    throw new Error("invalid base64 string");
                }
                one = one | v >> 4;
                arr[j++] = one;
                two = (v & 0x0f) << 4;
                break;
            case 2:
                if (v >= 0) {
                    two = two | v >> 2;
                    arr[j++] = two;
                    three = (v & 0x03) << 6;
                }
                break;
            case 3:
                if (v >= 0) {
                    arr[j++] = three | v;
                }
                break;
        }
    }
    return arr;
};
const Base64 = {
    encode,
    decode,
    newBinary
};

////////////////////////////////////////////////////////////////////////////////////////////

}}}}},{
  "extensions": [
    ".js",
    ".json"
  ]
});


/* Exports */
return {
  export: function () { return {
      Base64: Base64
    };},
  require: require,
  eagerModulePaths: [
    "/node_modules/meteor/base64/base64.js"
  ],
  mainModulePath: "/node_modules/meteor/base64/base64.js"
}});

//# sourceURL=meteor://💻app/packages/base64.js
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvYmFzZTY0L2Jhc2U2NC5qcyJdLCJuYW1lcyI6WyJCQVNFXzY0X0NIQVJTIiwiQkFTRV82NF9WQUxTIiwiT2JqZWN0IiwiY3JlYXRlIiwiZ2V0Q2hhciIsInZhbCIsImNoYXJBdCIsImdldFZhbCIsImNoIiwiaSIsImxlbmd0aCIsImVuY29kZSIsImFycmF5Iiwic3RyIiwibmV3QmluYXJ5IiwiY2hhckNvZGVBdCIsIkVycm9yIiwiYW5zd2VyIiwiYSIsImIiLCJjIiwiZCIsInB1c2giLCJqb2luIiwibGVuIiwiVWludDhBcnJheSIsIkFycmF5QnVmZmVyIiwicmV0IiwiJFVpbnQ4QXJyYXlQb2x5ZmlsbCIsImRlY29kZSIsIk1hdGgiLCJmbG9vciIsImFyciIsIm9uZSIsInR3byIsInRocmVlIiwiaiIsInYiLCJCYXNlNjQiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsbUJBQW1CO0FBRW5CLE1BQU1BLGdCQUFnQjtBQUV0QixNQUFNQyxlQUFlQyxPQUFPQyxNQUFNLENBQUM7QUFFbkMsTUFBTUMsVUFBVSxDQUFDQyxNQUFRTCxjQUFjTSxNQUFNLENBQUNEO0FBQzlDLE1BQU1FLFNBQVMsQ0FBQ0MsS0FBUUEsT0FBTyxNQUFNLENBQUMsSUFBSVAsWUFBWSxDQUFDTyxHQUFHO0FBRTFELElBQUssSUFBSUMsSUFBSSxHQUFHQSxJQUFJVCxjQUFjVSxNQUFNLEVBQUVELElBQUs7SUFDN0NSLFlBQVksQ0FBQ0csUUFBUUssR0FBRyxHQUFHQTtBQUM3QjtBQUVBLE1BQU1FLFNBQVMsQ0FBQ0M7SUFDZCxJQUFJLE9BQU9BLFVBQVUsVUFBVTtRQUM3QixNQUFNQyxNQUFNRDtRQUNaQSxRQUFRRSxVQUFVRCxJQUFJSCxNQUFNO1FBQzVCLElBQUssSUFBSUQsSUFBSSxHQUFHQSxJQUFJSSxJQUFJSCxNQUFNLEVBQUVELElBQUs7WUFDbkMsTUFBTUQsS0FBS0ssSUFBSUUsVUFBVSxDQUFDTjtZQUMx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QWlCLE1BQU1JLEtBQUs7Z0JBQ1g7WUFDRixLQUFLO2dCQUNILElBQUlBLElBQUksR0FBRztvQkFDVCxNQUFNLElBQUlyQixNQUFNO2dCQUNsQjtnQkFFQWlCLE1BQU1BLE1BQU9JLEtBQUs7Z0JBQ2xCTCxHQUFHLENBQUNJLElBQUksR0FBR0g7Z0JBQ1hDLE1BQU9HLEtBQUksSUFBRyxLQUFNO2dCQUNwQjtZQUNGLEtBQUs7Z0JBQ0gsSUFBSUEsS0FBSyxHQUFHO29CQUNWSCxNQUFNQSxNQUFPRyxLQUFLO29CQUNsQkwsR0FBRyxDQUFDSSxJQUFJLEdBQUdGO29CQUNYQyxRQUFTRSxLQUFJLElBQUcsS0FBTTtnQkFDeEI7Z0JBRUE7WUFDRixLQUFLO2dCQUNILElBQUlBLEtBQUssR0FBRztvQkFDVkwsR0FBRyxDQUFDSSxJQUFJLEdBQUdELFFBQVFFO2dCQUNyQjtnQkFFQTtRQUNKO0lBQ0Y7SUFFQSxPQUFPTDtBQUNUO0FBRUEsT0FBTyxNQUFNTSxHQUFTO0lBQUUzQjtJQUFRa0I7SUFBUWY7QUFBVSxFQUFFIiwiZmlsZSI6Ii9wYWNrYWdlcy9iYXNlNjQuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBCYXNlIDY0IGVuY29kaW5nXG5cbmNvbnN0IEJBU0VfNjRfQ0hBUlMgPSBcIkFCQ0RFRkdISUpLTE1OT1BRUlNUVVZXWFlaYWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXowMTIzNDU2Nzg5Ky9cIjtcblxuY29uc3QgQkFTRV82NF9WQUxTID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcblxuY29uc3QgZ2V0Q2hhciA9ICh2YWwpID0+IEJBU0VfNjRfQ0hBUlMuY2hhckF0KHZhbCk7XG5jb25zdCBnZXRWYWwgPSAoY2gpID0+IChjaCA9PT0gXCI9XCIgPyAtMSA6IEJBU0VfNjRfVkFMU1tjaF0pO1xuXG5mb3IgKGxldCBpID0gMDsgaSA8IEJBU0VfNjRfQ0hBUlMubGVuZ3RoOyBpKyspIHtcbiAgQkFTRV82NF9WQUxTW2dldENoYXIoaSldID0gaTtcbn1cblxuY29uc3QgZW5jb2RlID0gKGFycmF5KSA9PiB7XG4gIGlmICh0eXBlb2YgYXJyYXkgPT09IFwic3RyaW5nXCIpIHtcbiAgICBjb25zdCBzdHIgPSBhcnJheTtcbiAgICBhcnJheSA9IG5ld0JpbmFyeShzdHIubGVuZ3RoKTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHN0ci5sZW5ndGg7IGkrKykge1xuICAgICAgY29uc3QgY2ggPSBzdHIuY2hhckNvZGVBdChpKTtcbiAgICAgIGlmIChjaCA+IDB4ZmYpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiTm90IGFzY2lpLiBCYXNlNjQuZW5jb2RlIGNhbiBvbmx5IHRha2UgYXNjaWkgc3RyaW5ncy5cIik7XG4gICAgICB9XG5cbiAgICAgIGFycmF5W2ldID0gY2g7XG4gICAgfVxuICB9XG5cbiAgY29uc3QgYW5zd2VyID0gW107XG4gIGxldCBhID0gbnVsbDtcbiAgbGV0IGIgPSBudWxsO1xuICBsZXQgYyA9IG51bGw7XG4gIGxldCBkID0gbnVsbDtcblxuICBmb3IgKGxldCBpID0gMDsgaSA8IGFycmF5Lmxlbmd0aDsgaSsrKSB7XG4gICAgc3dpdGNoIChpICUgMykge1xuICAgICAgY2FzZSAwOlxuICAgICAgICBhID0gKGFycmF5W2ldID4+IDIpICYgMHgzZjtcbiAgICAgICAgYiA9IChhcnJheVtpXSAmIDB4MDMpIDw8IDQ7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAxOlxuICAgICAgICBiID0gYiB8ICgoYXJyYXlbaV0gPj4gNCkgJiAweGYpO1xuICAgICAgICBjID0gKGFycmF5W2ldICYgMHhmKSA8PCAyO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgMjpcbiAgICAgICAgYyA9IGMgfCAoKGFycmF5W2ldID4+IDYpICYgMHgwMyk7XG4gICAgICAgIGQgPSBhcnJheVtpXSAmIDB4M2Y7XG4gICAgICAgIGFuc3dlci5wdXNoKGdldENoYXIoYSkpO1xuICAgICAgICBhbnN3ZXIucHVzaChnZXRDaGFyKGIpKTtcbiAgICAgICAgYW5zd2VyLnB1c2goZ2V0Q2hhcihjKSk7XG4gICAgICAgIGFuc3dlci5wdXNoKGdldENoYXIoZCkpO1xuICAgICAgICBhID0gbnVsbDtcbiAgICAgICAgYiA9IG51bGw7XG4gICAgICAgIGMgPSBudWxsO1xuICAgICAgICBkID0gbnVsbDtcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG5cbiAgaWYgKGEgIT0gbnVsbCkge1xuICAgIGFuc3dlci5wdXNoKGdldENoYXIoYSkpO1xuICAgIGFuc3dlci5wdXNoKGdldENoYXIoYikpO1xuICAgIGlmIChjID09IG51bGwpIHtcbiAgICAgIGFuc3dlci5wdXNoKFwiPVwiKTtcbiAgICB9IGVsc2Uge1xuICAgICAgYW5zd2VyLnB1c2goZ2V0Q2hhcihjKSk7XG4gICAgfVxuXG4gICAgaWYgKGQgPT0gbnVsbCkge1xuICAgICAgYW5zd2VyLnB1c2goXCI9XCIpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBhbnN3ZXIuam9pbihcIlwiKTtcbn07XG5cbi8vIFhYWCBUaGlzIGlzIGEgd2VpcmQgcGxhY2UgZm9yIHRoaXMgdG8gbGl2ZSwgYnV0IGl0J3MgdXNlZCBib3RoIGJ5XG4vLyB0aGlzIHBhY2thZ2UgYW5kICdlanNvbicsIGFuZCB3ZSBjYW4ndCBwdXQgaXQgaW4gJ2Vqc29uJyB3aXRob3V0XG4vLyBpbnRyb2R1Y2luZyBhIGNpcmN1bGFyIGRlcGVuZGVuY3kuIEl0IHNob3VsZCBwcm9iYWJseSBiZSBpbiBpdHMgb3duXG4vLyBwYWNrYWdlIG9yIGFzIGEgaGVscGVyIGluIGEgcGFja2FnZSB0aGF0IGJvdGggJ2Jhc2U2NCcgYW5kICdlanNvbidcbi8vIHVzZS5cbmNvbnN0IG5ld0JpbmFyeSA9IChsZW4pID0+IHtcbiAgaWYgKHR5cGVvZiBVaW50OEFycmF5ID09PSBcInVuZGVmaW5lZFwiIHx8IHR5cGVvZiBBcnJheUJ1ZmZlciA9PT0gXCJ1bmRlZmluZWRcIikge1xuICAgIGNvbnN0IHJldCA9IFtdO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgIHJldC5wdXNoKDApO1xuICAgIH1cblxuICAgIHJldC4kVWludDhBcnJheVBvbHlmaWxsID0gdHJ1ZTtcbiAgICByZXR1cm4gcmV0O1xuICB9XG4gIHJldHVybiBuZXcgVWludDhBcnJheShuZXcgQXJyYXlCdWZmZXIobGVuKSk7XG59O1xuXG5jb25zdCBkZWNvZGUgPSAoc3RyKSA9PiB7XG4gIGxldCBsZW4gPSBNYXRoLmZsb29yKChzdHIubGVuZ3RoICogMykgLyA0KTtcbiAgaWYgKHN0ci5jaGFyQXQoc3RyLmxlbmd0aCAtIDEpID09IFwiPVwiKSB7XG4gICAgbGVuLS07XG4gICAgaWYgKHN0ci5jaGFyQXQoc3RyLmxlbmd0aCAtIDIpID09IFwiPVwiKSB7XG4gICAgICBsZW4tLTtcbiAgICB9XG4gIH1cblxuICBjb25zdCBhcnIgPSBuZXdCaW5hcnkobGVuKTtcblxuICBsZXQgb25lID0gbnVsbDtcbiAgbGV0IHR3byA9IG51bGw7XG4gIGxldCB0aHJlZSA9IG51bGw7XG5cbiAgbGV0IGogPSAwO1xuXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgc3RyLmxlbmd0aDsgaSsrKSB7XG4gICAgY29uc3QgYyA9IHN0ci5jaGFyQXQoaSk7XG4gICAgY29uc3QgdiA9IGdldFZhbChjKTtcbiAgICBzd2l0Y2ggKGkgJSA0KSB7XG4gICAgICBjYXNlIDA6XG4gICAgICAgIGlmICh2IDwgMCkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcImludmFsaWQgYmFzZTY0IHN0cmluZ1wiKTtcbiAgICAgICAgfVxuXG4gICAgICAgIG9uZSA9IHYgPDwgMjtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDE6XG4gICAgICAgIGlmICh2IDwgMCkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcImludmFsaWQgYmFzZTY0IHN0cmluZ1wiKTtcbiAgICAgICAgfVxuXG4gICAgICAgIG9uZSA9IG9uZSB8ICh2ID4+IDQpO1xuICAgICAgICBhcnJbaisrXSA9IG9uZTtcbiAgICAgICAgdHdvID0gKHYgJiAweDBmKSA8PCA0O1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgMjpcbiAgICAgICAgaWYgKHYgPj0gMCkge1xuICAgICAgICAgIHR3byA9IHR3byB8ICh2ID4+IDIpO1xuICAgICAgICAgIGFycltqKytdID0gdHdvO1xuICAgICAgICAgIHRocmVlID0gKHYgJiAweDAzKSA8PCA2O1xuICAgICAgICB9XG5cbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDM6XG4gICAgICAgIGlmICh2ID49IDApIHtcbiAgICAgICAgICBhcnJbaisrXSA9IHRocmVlIHwgdjtcbiAgICAgICAgfVxuXG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBhcnI7XG59O1xuXG5leHBvcnQgY29uc3QgQmFzZTY0ID0geyBlbmNvZGUsIGRlY29kZSwgbmV3QmluYXJ5IH07XG4iXX0=
