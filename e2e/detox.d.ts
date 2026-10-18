interface DetoxMatcher {
  readonly kind: "detox-matcher";
}

interface DetoxElement {
  typeText(text: string): Promise<void>;
  tap(): Promise<void>;
}

declare function element(matcher: DetoxMatcher): DetoxElement;

declare const by: {
  id(id: string): DetoxMatcher;
  text(text: string): DetoxMatcher;
};

declare const device: {
  launchApp(): Promise<void>;
};
