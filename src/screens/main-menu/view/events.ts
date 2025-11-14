import type {
  CleanupRegistrar,
  ComingSoonHandler,
  MainMenuShell,
  MenuCardMetadata
} from '../types.ts';

const TONE_ICONS: Record<string, string> = {
  greeting: '✨',
  focus: '🎯',
  gentle: '🌬️',
  motivate: '🔥',
  warning: '⚠️',
  calm: '🌙'
};

const TAG_CLASS_MAP = new Map<string, string>([
  ['PvE', 'mode-tag--pve'],
  ['PvP', 'mode-tag--pvp'],
  ['Coming soon', 'mode-tag--coming'],
  ['Kinh tế nguyên tinh', 'mode-tag--economy']
]);

const ECONOMY_COMPACT_KEYS = new Set<string>([
  'tongmon',
  'gacha',
  'lineup',
  'collection',
  'market',
  'events',
  'social'
]);

interface ModeDisplaySettings {
  displayMode: MenuCardMetadata;
  extraClasses: ReadonlyArray<string>;
}

function resolveDisplaySettings(mode: MenuCardMetadata): ModeDisplaySettings {
  if (mode?.key && ECONOMY_COMPACT_KEYS.has(mode.key)){
    const filteredTags = (mode.tags || []).filter(tag => tag && tag !== 'Kinh tế nguyên tinh' && tag !== 'Coming soon');
    const compactMode: MenuCardMetadata = {
      ...mode,
      description: undefined,
      tags: filteredTags
    };
    return {
      displayMode: compactMode,
      extraClasses: ['mode-card--compact']
    };
  }
  return {
    displayMode: mode,
    extraClasses: []
  };
}

export function cueTone(tone: string | null | undefined): { icon: string; tone: string } {
  if (tone && TONE_ICONS[tone]){
    return { icon: TONE_ICONS[tone], tone };
  }
  return { icon: '✦', tone: tone || 'calm' };
}

function resolveModeHeading(mode: MenuCardMetadata): string | null {
  if (typeof mode.title === 'string'){
    const trimmedTitle = mode.title.trim();
    return trimmedTitle.length > 0 ? trimmedTitle : null;
  }
  if (typeof mode.label === 'string'){
    const trimmedLabel = mode.label.trim();
    if (trimmedLabel.length > 0){
      return trimmedLabel;
    }
  }
  const trimmedKey = typeof mode.key === 'string' ? mode.key.trim() : '';
  return trimmedKey.length > 0 ? trimmedKey : null;
}

interface BuildModeCardOptions {
  extraClasses?: ReadonlyArray<string>;
  showStatus?: boolean;
}

function buildModeCardBase(
  element: HTMLElement,
  mode: MenuCardMetadata,
  options: BuildModeCardOptions = {}
): { statusEl: HTMLSpanElement | null }{
  const { extraClasses = [], showStatus = true } = options;
  element.classList.add('mode-card');
  extraClasses.forEach(cls => element.classList.add(cls));
  if (mode.key){
    element.dataset.mode = mode.key;
  }

  const icon = document.createElement('span');
  icon.className = 'mode-card__icon';
  icon.textContent = mode.icon || '◆';
  element.appendChild(icon);

  const headingText = resolveModeHeading(mode);
  if (headingText){
    const title = document.createElement('h3');
    title.className = 'mode-card__title';
    title.textContent = headingText;
    element.appendChild(title);
  }

  if (mode.description){
    const desc = document.createElement('p');
    desc.className = 'mode-card__desc';
    desc.textContent = mode.description;
    element.appendChild(desc);
  }

  const tags = document.createElement('div');
  tags.className = 'mode-card__tags';
  (mode.tags || []).forEach(tag => {
    if (!tag) return;
    const chip = document.createElement('span');
    chip.className = 'mode-tag';
    chip.textContent = tag;
    const mapped = TAG_CLASS_MAP.get(tag);
    if (mapped){
      chip.classList.add(mapped);
    }
    tags.appendChild(chip);
  });
  if (tags.childElementCount > 0){
    element.appendChild(tags);
  }

  let statusEl: HTMLSpanElement | null = null;
  if (showStatus && mode.status === 'coming-soon'){
    element.classList.add('mode-card--coming');
    if (mode.key){
      element.setAttribute('aria-describedby', `${mode.key}-status`);
    }
    element.setAttribute('aria-disabled', 'true');
    statusEl = document.createElement('span');
    if (mode.key){
      statusEl.id = `${mode.key}-status`;
    }
    statusEl.className = 'mode-card__status';
    statusEl.textContent = 'Coming soon';
    element.appendChild(statusEl);
  }

  return { statusEl };
}

interface ModeCardOptions {
  extraClasses?: ReadonlyArray<string>;
  extraClass?: string;
  showStatus?: boolean;
  onPrimaryAction?: (context: { mode: MenuCardMetadata; event: MouseEvent; element: HTMLButtonElement }) => void;
  afterCreate?: (element: HTMLButtonElement) => void;
}

export function createModeCard(
  mode: MenuCardMetadata,
  shell: MainMenuShell | null | undefined,
  onShowComingSoon: ComingSoonHandler | undefined,
  addCleanup: CleanupRegistrar,
  options: ModeCardOptions = {}
): HTMLButtonElement {
  const button = document.createElement('button');
  button.type = 'button';
  const { displayMode, extraClasses: displayExtraClasses } = resolveDisplaySettings(mode);
  const extraClasses = Array.isArray(options.extraClasses)
    ? [...options.extraClasses]
    : options.extraClass
      ? [options.extraClass]
      : [];
    displayExtraClasses.forEach(cls => {
    if (!extraClasses.includes(cls)){
      extraClasses.push(cls);
    }
  });

  buildModeCardBase(button, displayMode, {
    extraClasses,
    showStatus: options.showStatus !== false
  });

  const handleClick = (event: MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (typeof options.onPrimaryAction === 'function'){
      options.onPrimaryAction({ mode, event, element: button });
      return;
    }
    if (!shell || typeof shell.enterScreen !== 'function') return;
    if (mode.status === 'coming-soon'){
      if (typeof onShowComingSoon === 'function'){
        onShowComingSoon(mode);
      }
      shell.enterScreen(mode.id || 'main-menu', (mode.params as Record<string, unknown> | null) ?? null);
      return;
    }
    shell.enterScreen(mode.id || 'main-menu', (mode.params as Record<string, unknown> | null) ?? null);
  };

  button.addEventListener('click', handleClick);
  addCleanup(() => button.removeEventListener('click', handleClick));

  if (typeof options.afterCreate === 'function'){
    options.afterCreate(button);
  }

  return button;
}

export function createModeGroupCard(
  group: MenuCardMetadata,
  childModes: ReadonlyArray<MenuCardMetadata>,
  shell: MainMenuShell | null | undefined,
  onShowComingSoon: ComingSoonHandler | undefined,
  addCleanup: CleanupRegistrar
): HTMLDivElement {
  const wrapper = document.createElement('div');
  const groupClasses = Array.isArray(group.extraClasses)
    ? ['mode-card--group', ...group.extraClasses]
    : ['mode-card--group'];
  buildModeCardBase(wrapper, group, { extraClasses: groupClasses, showStatus: false });
  wrapper.setAttribute('role', 'button');
  wrapper.setAttribute('aria-haspopup', 'true');
  wrapper.setAttribute('aria-expanded', 'false');
  const groupHeadingText = resolveModeHeading(group);
  if (groupHeadingText){
    wrapper.setAttribute('aria-label', `Chọn chế độ trong ${groupHeadingText}`);
  }
  wrapper.tabIndex = 0;

  const infoBlock = document.createElement('div');
  infoBlock.className = 'mode-card__group-info';
  infoBlock.setAttribute('aria-hidden', 'false');
  const existingIcon = wrapper.querySelector('.mode-card__icon');
  const existingTitle = wrapper.querySelector('.mode-card__title');
  const existingDesc = wrapper.querySelector('.mode-card__desc');
  if (existingIcon){
    infoBlock.appendChild(existingIcon);
  }
  if (existingTitle){
    infoBlock.appendChild(existingTitle);
  }
  if (existingDesc){
    infoBlock.appendChild(existingDesc);
  }
  wrapper.insertBefore(infoBlock, wrapper.firstChild);

  const caret = document.createElement('span');
  caret.className = 'mode-card__group-caret';
  caret.setAttribute('aria-hidden', 'true');
  caret.textContent = '▾';
  wrapper.appendChild(caret);

  const childrenGrid = document.createElement('div');
  childrenGrid.className = 'mode-card__group-children';
  childrenGrid.setAttribute('role', 'menu');
  childrenGrid.setAttribute('aria-hidden', 'true');
  childrenGrid.hidden = true;
  wrapper.appendChild(childrenGrid);

  let isOpen = false;
  let documentListenerActive = false;

  const close = () => {
    if (!isOpen) return;
    isOpen = false;
    wrapper.classList.remove('is-open');
    wrapper.setAttribute('aria-expanded', 'false');
    infoBlock.hidden = false;
    infoBlock.setAttribute('aria-hidden', 'false');
    childrenGrid.hidden = true;
    childrenGrid.setAttribute('aria-hidden', 'true');
    if (documentListenerActive){
      document.removeEventListener('click', handleDocumentClick, true);
      documentListenerActive = false;
    }
  };

  const open = () => {
    if (isOpen) return;
    isOpen = true;
    wrapper.classList.add('is-open');
    wrapper.setAttribute('aria-expanded', 'true');
    infoBlock.hidden = true;
    infoBlock.setAttribute('aria-hidden', 'true');
    childrenGrid.hidden = false;
    childrenGrid.setAttribute('aria-hidden', 'false');
    if (!documentListenerActive){
      document.addEventListener('click', handleDocumentClick, true);
      documentListenerActive = true;
    }
  };

  const toggle = () => {
    if (isOpen){
      close();
    } else {
      open();
    }
  };

  function handleDocumentClick(event: MouseEvent): void{
    if (!wrapper.contains(event.target as Node)){
      close();
    }
  }

  const handleToggle = (event: MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    toggle();
  };

  const handleKeydown = (event: KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' '){
      event.preventDefault();
      toggle();
      return;
    }
    if (event.key === 'Escape' && isOpen){
      event.preventDefault();
      close();
      wrapper.focus({ preventScroll: true });
    }
  };

  const handleFocusOut = (event: FocusEvent) => {
    if (!isOpen) return;
    if (!wrapper.contains(event.relatedTarget as Node | null)){
      close();
    }
  };

  wrapper.addEventListener('click', handleToggle);
  wrapper.addEventListener('keydown', handleKeydown);
  wrapper.addEventListener('focusout', handleFocusOut);

  addCleanup(() => {
    wrapper.removeEventListener('click', handleToggle);
    wrapper.removeEventListener('keydown', handleKeydown);
    wrapper.removeEventListener('focusout', handleFocusOut);
    if (documentListenerActive){
      document.removeEventListener('click', handleDocumentClick, true);
      documentListenerActive = false;
    }
  });

  childModes.forEach(child => {
    const item = document.createElement('button');
    item.type = 'button';
    item.className = 'mode-card__child';
    if (child.key){
      item.dataset.mode = child.key;
    }
    item.setAttribute('role', 'menuitem');
    if (child.status === 'coming-soon'){
      item.classList.add('mode-card__child--coming');
    }

    const icon = document.createElement('span');
    icon.className = 'mode-card__child-icon';
    icon.textContent = child.icon || '◆';
    item.appendChild(icon);

    const body = document.createElement('span');
    body.className = 'mode-card__child-body';

    const title = document.createElement('span');
    title.className = 'mode-card__child-title';
    title.textContent = child.title || child.label || child.key || '';
    body.appendChild(title);

    const status = document.createElement('span');
    status.className = 'mode-card__child-status';
    status.textContent = child.status === 'coming-soon' ? 'Coming soon' : 'Sẵn sàng';
    body.appendChild(status);

    if (child.description){
      const desc = document.createElement('span');
      desc.className = 'mode-card__child-desc';
      desc.textContent = child.description;
      body.appendChild(desc);
    }

    item.appendChild(body);

    const handleSelect = (event: MouseEvent) => {
      event.preventDefault();
      event.stopPropagation();
      if (!shell || typeof shell.enterScreen !== 'function') return;
      if (child.status === 'coming-soon' && typeof onShowComingSoon === 'function'){
        onShowComingSoon(child);
      }
      shell.enterScreen(child.id || 'main-menu', (child.params as Record<string, unknown> | null) ?? null);
      close();
      wrapper.focus({ preventScroll: true });
    };

    item.addEventListener('click', handleSelect);
    addCleanup(() => item.removeEventListener('click', handleSelect));

    childrenGrid.appendChild(item);
  });

  return wrapper;
      }
