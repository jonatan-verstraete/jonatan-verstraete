// null action = WIP — omitted from results
export const COMMANDS = [
  {
    id: 'list',
    label: 'list',
    description: 'Show all projects',
    action: 'list',
    param: null,
  },
  {
    id: 'recent',
    label: 'recent',
    description: 'Sort by most recent',
    action: 'recent',
    param: null,
  },
  {
    id: 'open-sidebar',
    label: 'open-sidebar',
    description: 'Open the oracle sidebar',
    action: 'open-sidebar',
    param: null,
  },
  {
    id: 'set-user',
    label: 'set-user',
    description: 'Set GitHub user for project search',
    action: 'set-user',
    param: '$name',
  },
  {
    id: 'theater',
    label: 'theater',
    description: 'Enter theater mode',
    action: null,
    param: null,
  },
  {
    id: 'exit-theater',
    label: 'exit-theater',
    description: 'Exit theater mode',
    action: null,
    param: null,
  },
];

export const ACTIVE_COMMANDS = COMMANDS.filter((c) => c.action !== null);
