# meteor-issue-repros

Reproduções mínimas de issues do [meteor/meteor](https://github.com/meteor/meteor).

**Uma branch por issue** — `issue-<num>`. A `main` é só este índice.

| Issue | Branch | PR |
|-------|--------|----|
| [#13489](https://github.com/meteor/meteor/issues/13489) — `Meteor.settings.public` runtime updates not sent to new clients | [`issue-13489`](https://github.com/italojs/meteor-issue-repros/tree/issue-13489) | [italojs/meteor-italo-private#20](https://github.com/italojs/meteor-italo-private/pull/20) |
| [#13490](https://github.com/meteor/meteor/issues/13490) — SIGTERM listener leaks dev server instances | [`issue-13490`](https://github.com/italojs/meteor-issue-repros/tree/issue-13490) | [italojs/meteor-italo-private#21](https://github.com/italojs/meteor-italo-private/pull/21) |
| [#12759](https://github.com/meteor/meteor/issues/12759) — client leaks a global `require` | [`issue-12759`](https://github.com/italojs/meteor-issue-repros/tree/issue-12759) | [italojs/meteor-italo-private#22](https://github.com/italojs/meteor-italo-private/pull/22) |
| [#12718](https://github.com/meteor/meteor/issues/12718) — extensionless import resolves `.css` over `.tsx` | [`issue-12718`](https://github.com/italojs/meteor-issue-repros/tree/issue-12718) | [italojs/meteor-italo-private#23](https://github.com/italojs/meteor-italo-private/pull/23) |
| [#13245](https://github.com/meteor/meteor/issues/13245) — minify stats parse failure aborts the production build | [`issue-13245`](https://github.com/italojs/meteor-issue-repros/tree/issue-13245) | [italojs/meteor-italo-private#24](https://github.com/italojs/meteor-italo-private/pull/24) |
| [#12164](https://github.com/meteor/meteor/issues/12164) — wrong error importing a missing file from an installed package | [`issue-12164`](https://github.com/italojs/meteor-issue-repros/tree/issue-12164) | [italojs/meteor-italo-private#25](https://github.com/italojs/meteor-italo-private/pull/25) |
| [#12029](https://github.com/meteor/meteor/issues/12029) — native driver ObjectId unusable on the client | [`issue-12029`](https://github.com/italojs/meteor-issue-repros/tree/issue-12029) | [italojs/meteor-italo-private#26](https://github.com/italojs/meteor-italo-private/pull/26) |
| [#12688](https://github.com/meteor/meteor/issues/12688) — positional (`$`) projection crashes change-stream subscription | [`issue-12688`](https://github.com/italojs/meteor-issue-repros/tree/issue-12688) | [italojs/meteor-italo-private#27](https://github.com/italojs/meteor-italo-private/pull/27) |
| [#12172](https://github.com/meteor/meteor/issues/12172) — installer creates `~/.bash_profile`, shadowing `~/.profile` | [`issue-12172`](https://github.com/italojs/meteor-issue-repros/tree/issue-12172) | [italojs/meteor-italo-private#28](https://github.com/italojs/meteor-italo-private/pull/28) |
| [#13276](https://github.com/meteor/meteor/issues/13276) — build crashes (`ERR_FS_FILE_TOO_LARGE`) on >2 GiB bundle files | [`issue-13276`](https://github.com/italojs/meteor-issue-repros/tree/issue-13276) | [italojs/meteor-italo-private#29](https://github.com/italojs/meteor-italo-private/pull/29) |
| [#12421](https://github.com/meteor/meteor/issues/12421) — iOS Safari version parsed from Safari token → wrong legacy bundle | [`issue-12421`](https://github.com/italojs/meteor-issue-repros/tree/issue-12421) | [italojs/meteor-italo-private#30](https://github.com/italojs/meteor-italo-private/pull/30) |

- [#11918](https://github.com/meteor/meteor/issues/11918) — RangeError reading unibuild resource at offset — [repro](https://github.com/italojs/meteor-issue-repros/tree/issue-11918) — PR italojs/meteor-italo-private#42

- [#12772](https://github.com/meteor/meteor/issues/12772) — no Content-Length on built JS/CSS — [repro](https://github.com/italojs/meteor-issue-repros/tree/issue-12772) — PR italojs/meteor-italo-private#43

- [#13653](https://github.com/meteor/meteor/issues/13653) — infinite reload loop with cross-origin DDP_DEFAULT_CONNECTION_URL — [repro](https://github.com/italojs/meteor-issue-repros/tree/issue-13653) — PR italojs/meteor-italo-private#44

- [#11808](https://github.com/meteor/meteor/issues/11808) — installer should repair PATH when already installed — [repro](https://github.com/italojs/meteor-issue-repros/tree/issue-11808) — PR italojs/meteor-italo-private#45

- [#14594](https://github.com/meteor/meteor/issues/14594) — Invalid URL crashes the server via the SockJS transport — [repro](https://github.com/italojs/meteor-issue-repros/tree/issue-14594) — upstream PR meteor/meteor#14598 (private #46)

- [#14604](https://github.com/meteor/meteor/issues/14604) — change-stream observe driver stuck in an infinite restart loop after ChangeStreamHistoryLost (error 286) — [repro](https://github.com/italojs/meteor-issue-repros/tree/issue-14604) — PR italojs/meteor-italo-private#48

- [#14600](https://github.com/meteor/meteor/issues/14600) — change-stream fence test CI regression on release-3.5.1 (compareOperationTimes mishandles a plain `{t,i}` operand, exposed by #14564's caught-up-floor seed) — [repro](https://github.com/italojs/meteor-issue-repros/tree/issue-14600) — PR italojs/meteor-italo-private#49
