# java_backend

A Java and Spring Boot implementation of the NotesBanao portal API.

The front end one folder up can talk to either this service or the small Node
demo backend bundled with it. They implement the same contract, written down in
[../API-CONTRACT.md](../API-CONTRACT.md), so switching between them is one
environment variable and no code change.

**What is real here:** the API surface. Every endpoint, URL, request shape and
response shape is defined as a Java interface with Spring annotations, and those
interfaces are the deliverable.

**What is not:** the implementation behind them. Data lives in memory, loaded
from the sample JSON in `src/main/resources/seed`. There is no database, no
password checking, no email, no payment gateway and no language model. It is
enough to make the front end work end to end, and it is meant to be replaced.

---

## Running it

Needs **JDK 21** and **Maven**.

```bash
mvn spring-boot:run
```

It listens on <http://127.0.0.1:8080>. Check it is alive:

```bash
curl -i http://127.0.0.1:8080/api/auth/me
```

A 401 with `{"ok":false,"message":"Not logged in."}` is the correct answer when
you have no session.

Then point the front end at it — in `notesbanao-portal/.env.local`:

```
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8080
```

and restart `npm run dev`. See [../README.md](../README.md) for the whole
picture.

Other useful commands:

```bash
mvn compile
```

```bash
mvn package
```

```bash
java -jar target/portal-backend-0.1.0.jar
```

## How it is laid out

Package by feature. Each feature owns its API interface, its controller, its
service and its DTOs, so everything about (say) the wallet is in one place.

```
com.notesbanao.portal
  PortalApplication            entry point

  config/
    PortalProperties           everything under `portal:` in application.yml
    CorsConfig                 which origins may call this API with cookies

  common/
    ApiException               a failure the user should see
    GlobalExceptionHandler     turns exceptions into the contract error shape
    ErrorResponse, UserMessage
    PageMeta, Paging           the pagination envelope and list slicing
    SimpleResponse, Ids

  auth/          AuthApi, AuthController, AuthService, SessionService, GoogleApi...
  wallet/        WalletApi, WalletController, WalletService, dto/
  billing/       BillingApi, BillingController, BillingService, dto/
  notes/         NotesApi, NotesController, NotesService, dto/
  transcript/    TranscriptApi, TranscriptController, TranscriptService, dto/
  trial/         TrialApi, TrialController, TrialService, dto/
  account/       AccountApi, PublicAccountApi, controllers, service, dto/
  demo/          DemoApi, DemoController

  store/
    DemoDataStore              the in-memory data — the part you replace
    SampleData                 reads the seed JSON
```

### The three layers

**The `*Api` interfaces are the contract.** They carry the `@RequestMapping`
annotations, so any implementation is forced to expose the same URLs, and
swapping the implementation cannot quietly change the API. Read these first.

**The `*Controller` classes are plumbing.** They check the session, call a
service and return the result. They contain no routing detail — that is
inherited from the interface — and no business rules.

**The `*Service` classes hold the rules.** Charging NB Points by recording
length, working GST back out of an inclusive price, deciding whether a coupon
can be claimed. This is where real work goes.

### The seam

Every service reads and writes `store.DemoDataStore` and nothing else
persistent. Giving this application a real database means replacing that one
class with repositories, and leaving the controllers, the interfaces and the
front end untouched.

## Configuration

Everything lives in `src/main/resources/application.yml` under `portal:`, and
each value can be overridden with an environment variable.

| Setting | Default | What it does |
|---|---|---|
| `portal.cors.allowed-origins` | `http://127.0.0.1:3000`, `http://localhost:3000` | Origins allowed to call the API with cookies |
| `portal.session.cookie-name` | `notesbanao_demo_session` | Same name the Node backend uses |
| `portal.session.secure` | `false` | Turn on behind HTTPS |
| `portal.demo.otp` | `123456` | The verification code this build accepts |
| `portal.demo.reset-endpoint-enabled` | `true` | Whether `POST /api/demo/reset` exists |
| `portal.seller.*` | placeholders | Who appears on a GST invoice |

The seller details are placeholders on purpose, exactly like
`lib/business-info.ts` on the front end. Do not put real registration details in
this repository.

## Things worth knowing

**CORS and cookies.** The front end is on another port, so every call is
cross-origin and carries a cookie. That combination needs an explicit origin
list — never `*` — plus `allowCredentials`, or the browser silently discards the
response. Both are set in `CorsConfig`.

**Use one hostname.** Cookies are shared across ports on a single host, but
`127.0.0.1` and `localhost` count as different hosts. Serve the front end and
this API on the same one or you will appear signed out on every request.

**snake_case record components.** `UserDto` has fields like `has_password`. That
is unusual Java, and deliberate: the contract is snake_case there, and matching
it exactly means Jackson needs no annotations and the two cannot drift apart.
The transcript DTO is camelCase for the same reason.

**Null fields are omitted.** `application.yml` sets Jackson to skip nulls, so
optional fields such as `termsRequired` and `dev_otp` simply do not appear
rather than arriving as null. The front end treats both the same way.

**The sample data resets on restart.** It is in memory. `POST /api/demo/reset`
does the same thing without a restart.

**The seed files are a copy.** `src/main/resources/seed` mirrors the Node
backend's `demo-backend/data`, so both start from the same fixtures. Keep them
in sync if you edit either.

## Turning this into a real backend

Roughly in order:

1. Add a database. Replace `DemoDataStore` with Spring Data repositories and
   entities. Nothing above it should need to change.
2. Add real authentication. `AuthService` currently accepts any email and any
   password of 8 characters. Hash passwords, and make `SessionService` issue
   something signed rather than a bare marker cookie.
3. Add the email that the flows assume exists: verification, password reset,
   referral invites, deletion confirmation.
4. Add a payment gateway. `WalletService.recharge` settles instantly today; a
   real one creates an order, redirects the browser, and credits points only
   once the gateway confirms — never from the client.
5. Add the notes pipeline. `TranscriptService.generate` writes a template.

Do the first one and the front end will not notice. That is the point of the
interfaces.
