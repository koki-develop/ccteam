import { describe, expect, it } from "bun:test";
import { quote } from "./util";

describe("util", () => {
  describe("quote", () => {
    it("should quote basic strings without special characters", () => {
      expect(quote("hello")).toBe('"hello"');
      expect(quote("world")).toBe('"world"');
      expect(quote("simple")).toBe('"simple"');
    });

    it("should handle empty strings", () => {
      expect(quote("")).toBe('""');
    });

    it("should handle whitespace", () => {
      expect(quote(" ")).toBe('" "');
      expect(quote("hello world")).toBe('"hello world"');
      expect(quote("  leading spaces")).toBe('"  leading spaces"');
      expect(quote("trailing spaces  ")).toBe('"trailing spaces  "');
      expect(quote("\t\n\r")).toBe('"\\t\\n\\r"');
    });

    it("should handle single quotes", () => {
      expect(quote("don't")).toBe('"don\'t"');
      expect(quote("it's working")).toBe('"it\'s working"');
      expect(quote("'quoted'")).toBe("\"'quoted'\"");
    });

    it("should handle double quotes with proper escaping", () => {
      expect(quote('say "hello"')).toBe('"say \\"hello\\""');
      expect(quote('"fully quoted"')).toBe('"\\"fully quoted\\""');
      expect(quote('nested "quotes" here')).toBe('"nested \\"quotes\\" here"');
    });

    it("should handle backslashes and escape sequences", () => {
      expect(quote("path\\to\\file")).toBe('"path\\\\to\\\\file"');
      expect(quote('escaped\\"quote')).toBe('"escaped\\\\\\"quote"');
      expect(quote("newline\\n")).toBe('"newline\\\\n"');
      expect(quote("tab\\t")).toBe('"tab\\\\t"');
    });

    it("should handle special shell characters", () => {
      expect(quote("Bash(git:*)")).toBe('"Bash(git:*)"');
      expect(quote("file*.txt")).toBe('"file*.txt"');
      expect(quote("command | grep")).toBe('"command | grep"');
      expect(quote("var=value")).toBe('"var=value"');
      expect(quote("$HOME/path")).toBe('"$HOME/path"');
      expect(quote("command; other")).toBe('"command; other"');
      expect(quote("value&background")).toBe('"value&background"');
    });

    it("should handle parentheses and brackets", () => {
      expect(quote("func()")).toBe('"func()"');
      expect(quote("array[index]")).toBe('"array[index]"');
      expect(quote("{key: value}")).toBe('"{key: value}"');
      expect(quote("nested(sub(func))")).toBe('"nested(sub(func))"');
    });

    it("should handle comma-separated values", () => {
      expect(quote("a,b,c")).toBe('"a,b,c"');
      expect(quote("Bash,Read,Edit")).toBe('"Bash,Read,Edit"');
      expect(quote("Bash(git:*),Edit")).toBe('"Bash(git:*),Edit"');
    });

    it("should handle Unicode characters", () => {
      expect(quote("café")).toBe('"café"');
      expect(quote("🎉")).toBe('"🎉"');
      expect(quote("中文")).toBe('"中文"');
      expect(quote("русский")).toBe('"русский"');
    });

    it("should handle control characters", () => {
      expect(quote("\x00")).toBe('"\\u0000"');
      expect(quote("\x01")).toBe('"\\u0001"');
      expect(quote("\x1f")).toBe('"\\u001f"');
    });

    it("should handle mixed complex cases", () => {
      expect(quote('Bash(git:commit --message="fix bug")')).toBe(
        '"Bash(git:commit --message=\\"fix bug\\")"',
      );
      expect(quote('tool\\path\\with"quotes"')).toBe(
        '"tool\\\\path\\\\with\\"quotes\\""',
      );
      expect(quote("unicode café with (parentheses) and 'quotes'")).toBe(
        "\"unicode café with (parentheses) and 'quotes'\"",
      );
    });

    it("should produce shell-safe output for tool examples", () => {
      const tools = ["Bash(git:*)", "Edit"];
      const joined = tools.join(",");
      const quoted = quote(joined);
      expect(quoted).toBe('"Bash(git:*),Edit"');
    });

    it("should handle edge case characters that need escaping", () => {
      expect(quote("\b")).toBe('"\\b"');
      expect(quote("\f")).toBe('"\\f"');
      expect(quote("\n")).toBe('"\\n"');
      expect(quote("\r")).toBe('"\\r"');
      expect(quote("\t")).toBe('"\\t"');
      expect(quote("\v")).toBe('"\\u000b"');
    });

    it("should maintain consistency with JSON.stringify behavior", () => {
      const testCases = [
        "normal string",
        'string with "quotes"',
        "string\\with\\backslashes",
        "string\nwith\nnewlines",
        "unicode 🌟 characters",
        "Bash(git:commit,push,pull)",
      ];

      for (const testCase of testCases) {
        expect(quote(testCase)).toBe(JSON.stringify(testCase));
      }
    });
  });
});
