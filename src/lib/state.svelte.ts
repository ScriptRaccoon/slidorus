type APP_STATE = 'idle' | 'moving' | 'scrambling' | 'editing'

export const app = $state<{ state: APP_STATE }>({ state: 'idle' })
