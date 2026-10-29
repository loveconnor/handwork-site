import { Check, ChevronDown, CircleAlert, CircleCheck, FileCode, FileText, Lock, MessageSquare, Plus, ArrowUp, Search, SquarePen, SquareTerminal, Zap } from "honestui/icons";
import ProviderMark from "./ProviderMark";

// Small recreations of Handwork desktop app panels for the feature cards.
// Labels, permission modes, and layout follow the desktop app's own UI
// (handwork-desktop src/features). They are decorative and hidden from
// assistive technology by the card that holds them.

const icon = { size: 14, strokeWidth: 1.75, "aria-hidden": true, focusable: "false" };

function Composer({ children }) {
  return (
    <div className="app-composer">
      <p>Write a message. Use / for commands or @ to reference files.</p>
      <div className="app-composer-bar"><span className="app-icon-button"><Plus {...icon} size={13} /></span>{children}<span className="app-send"><ArrowUp {...icon} size={13} /></span></div>
    </div>
  );
}

function Chip({ children, icon: Icon }) {
  return <span className="app-chip">{Icon && <Icon {...icon} size={13} />}{children}<ChevronDown {...icon} size={12} /></span>;
}

export function ChangesMock() {
  return (
    <div className="app app-changes">
      <div className="app-segments"><span>Explorer</span><span className="is-on"><b className="app-add">+1</b><b className="app-del">-1</b></span><span>History</span></div>
      <p className="app-group">Changes<span>1</span></p>
      <p className="app-file"><FileCode {...icon} /><span>slug.js</span><span className="app-file-stat"><b className="app-add">+1</b><b className="app-del">-1</b></span></p>
      <div className="app-diff">
        <p className="is-hunk"><i></i><i></i><code>@@ -2 +2 @@ function slug(value)</code></p>
        <p className="is-del"><i>2</i><i>-</i><code>{"return value.toLowerCase().replace(' ', '-');"}</code></p>
        <p className="is-add"><i>2</i><i>+</i><code>{"return value.trim().toLowerCase().replace(/\\s+/g, '-');"}</code></p>
      </div>
      <div className="app-commit"><span>Fix slug spacing</span><b>Commit</b></div>
    </div>
  );
}

export function ReadMock() {
  return (
    <div className="app app-chat">
      <p className="app-bubble">Fix the bug in slug.js</p>
      <p className="app-reply">I&apos;ll inspect slug.js and the existing test first.</p>
      <div className="app-tool">
        <p className="app-tool-head"><span className="app-dot"></span>2 read<ChevronDown {...icon} size={12} /></p>
        <p><FileText {...icon} size={13} />Read <span>slug.js</span></p>
        <p><FileText {...icon} size={13} />Read <span>test.js</span></p>
      </div>
      <Composer><Chip icon={Lock}>Supervised</Chip></Composer>
    </div>
  );
}

export function TestsMock() {
  return (
    <div className="app app-chat">
      <div className="app-tool">
        <p className="app-tool-head"><SquareTerminal {...icon} size={13} />Ran <span>node test.js</span><ChevronDown {...icon} size={12} /></p>
        <pre className="app-output"><span>$ node test.js</span>{"\n"}passed</pre>
        <p className="app-pass"><CircleCheck {...icon} size={13} />Exit code 0</p>
      </div>
      <Composer><Chip icon={Lock}>Supervised</Chip></Composer>
    </div>
  );
}

// Permission modes and hints from RUNTIME_MODE_LABEL and RUNTIME_MODE_HINT.
const modes = [
  ["Supervised", "Ask for approval before running commands or changing files."],
  ["Auto-accept edits", "Allow file edits automatically. Ask for approval for other actions."],
  ["Auto", "Let an AI reviewer approve or deny actions."],
  ["Full access", "Allow commands and file edits without asking for approval."],
];

export function PermissionsMock() {
  return (
    <>
      <div className="app app-modes">
        <div className="app-menu">
          {modes.map(([label, hint], index) => (
            <p key={label} className={index === 0 ? "is-on" : undefined}>
              <span>{label}<small>{hint}</small></span>{index === 0 && <Check {...icon} />}
            </p>
          ))}
        </div>
        <div className="app-composer-bar"><span className="app-icon-button"><Plus {...icon} size={13} /></span><Chip>Select model</Chip><Chip icon={Lock}>Supervised</Chip></div>
      </div>
      <div className="app app-toast">
        <p className="app-toast-head"><span className="app-toast-title">Fix slug spacing</span><span className="app-toast-kind"><CircleAlert {...icon} size={13} />Approval</span></p>
        <p className="app-toast-label">Run node test.js</p>
        <p className="app-toast-meta">Handwork</p>
        <p className="app-toast-actions"><b>Allow</b><b>Deny</b></p>
      </div>
    </>
  );
}

export function ModelsMock({ providers }) {
  return (
    <div className="app app-models">
      <p className="app-search"><Search {...icon} size={13} />Search providers</p>
      <p className="app-group">Providers</p>
      <ul>
        {providers.map((name, index) => (
          <li key={name} className={index === 1 ? "is-on" : undefined}><ProviderMark name={name} size={15} />{name}{index === 1 && <Check {...icon} size={13} />}</li>
        ))}
      </ul>
      <div className="app-composer-bar"><span className="app-icon-button"><Plus {...icon} size={13} /></span><Chip>Anthropic</Chip><span className="app-send"><ArrowUp {...icon} size={13} /></span></div>
    </div>
  );
}

export function SessionsMock() {
  return (
    <div className="app app-sidebar">
      <p className="app-brand">Handwork</p>
      <p className="app-nav"><SquarePen {...icon} />New chat<kbd>⌘N</kbd></p>
      <p className="app-nav"><MessageSquare {...icon} />Chats</p>
      <p className="app-nav"><Zap {...icon} />Automations</p>
      <p className="app-group">Today</p>
      <p className="app-nav is-on"><MessageSquare {...icon} />Fix slug spacing<time>now</time></p>
      <p className="app-nav"><MessageSquare {...icon} />Review changes<time>2h</time></p>
      <p className="app-group">Yesterday</p>
      <p className="app-nav"><MessageSquare {...icon} />Plan next release<time>1d</time></p>
    </div>
  );
}
