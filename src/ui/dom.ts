const DEFAULT_ASSERT_MESSAGE = 'Cần một phần tử DOM hợp lệ.';

export type ElementGuard<TElement extends Element> = (node: Element) => node is TElement;

export interface AssertElementOptions<TElement extends Element> {
  guard?: ElementGuard<TElement>;
  message?: string;
}

export function assertElement<TElement extends Element>(
  value: unknown,
  options?: AssertElementOptions<TElement> | string,
): TElement {
  const message = typeof options === 'string'
    ? options
    : options?.message ?? DEFAULT_ASSERT_MESSAGE;
  const guard = typeof options === 'object' && options ? options.guard : undefined;
  const ElementConstructor = typeof Element === 'undefined' ? undefined : Element;
  if (!ElementConstructor || !(value instanceof ElementConstructor)){
    throw new Error(message);
  }
  if (guard && !guard(value)){
    throw new Error(message);
  }
  return value as TElement;
}

export interface EnsureStyleTagOptions<TStyle extends HTMLStyleElement = HTMLStyleElement> {
  doc?: Document | null;
  css?: string | null;
  target?: ParentNode | null;
}

export function ensureStyleTag<TStyle extends HTMLStyleElement = HTMLStyleElement>(
  id: string,
  options: EnsureStyleTagOptions<TStyle> = {},
): TStyle | null {
  const doc = options.doc ?? (typeof document !== 'undefined' ? document : null);
  if (!doc){
    return null;
  }
  const appendTarget = options.target ?? doc.head ?? doc.documentElement ?? doc.body ?? null;
  let style = doc.getElementById(id);
  if (!(style instanceof HTMLStyleElement)){
    style = doc.createElement('style');
    style.id = id;
    if (appendTarget){
      appendTarget.appendChild(style);
    } else {
      doc.appendChild(style);
    }
  }
  const css = options.css;
  if (typeof css === 'string' && style.textContent !== css){
    style.textContent = css;
  }
  return style as TStyle;
}

type ClassListInput = string | ReadonlyArray<string> | null | undefined;

function normalizeClasses(input: ClassListInput): string[] {
  if (!input){
    return [];
  }
  return (Array.isArray(input) ? input : [input]).filter((item): item is string => Boolean(item?.trim?.() ?? item));
}

export interface MountSectionOptions<
  TRoot extends Element = HTMLElement,
  TSection extends Element = HTMLElement,
> {
  root: TRoot | null | undefined;
  section: TSection;
  replaceChildren?: boolean;
  rootClasses?: ClassListInput;
  removeRootClasses?: ClassListInput;
  onDestroy?: (() => void) | null;
  assertMessage?: string;
}

export interface MountedSection<
  TRoot extends Element = HTMLElement,
  TSection extends Element = HTMLElement,
> {
  root: TRoot;
  section: TSection;
  destroy(): void;
}

export function mountSection<
  TRoot extends Element = HTMLElement,
  TSection extends Element = HTMLElement,
>(options: MountSectionOptions<TRoot, TSection>): MountedSection<TRoot, TSection> {
  const {
    root,
    section,
    replaceChildren = true,
    rootClasses,
    removeRootClasses,
    onDestroy = null,
    assertMessage,
  } = options;

  const host = assertElement<TRoot>(root, assertMessage ?? 'Cần một phần tử root hợp lệ.');
  const classesToAdd = normalizeClasses(rootClasses);
  const classesToRemove = normalizeClasses(removeRootClasses);
  const removedRootClasses: string[] = [];

  if (replaceChildren){
    if ('replaceChildren' in host && typeof host.replaceChildren === 'function'){
      host.replaceChildren();
    } else {
      while (host.firstChild){
        host.removeChild(host.firstChild);
      }
    }
  }

  if (classesToRemove.length > 0 && host.classList){
    const seen = new Set<string>();
    classesToRemove.forEach(cls => {
      if (seen.has(cls)){
        return;
      }
      seen.add(cls);
      if (host.classList.contains(cls)){
        removedRootClasses.push(cls);
      }
      host.classList.remove(cls);
    });
  }

  if (classesToAdd.length > 0 && host.classList){
    classesToAdd.forEach(cls => host.classList.add(cls));
  }

  host.appendChild(section);

  return {
    root: host,
    section,
    destroy(){
      if (section.parentNode === host){
        host.removeChild(section);
      }
      if (classesToAdd.length > 0 && host.classList){
        classesToAdd.forEach(cls => host.classList.remove(cls));
      }
      if (removedRootClasses.length > 0 && host.classList){
        removedRootClasses.forEach(cls => host.classList.add(cls));
      }
      if (typeof onDestroy === 'function'){
        onDestroy();
      }
    }
  } satisfies MountedSection<TRoot, TSection>;
    }
