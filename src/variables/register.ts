import type { AnimationPropertyRegisterCollection, CssInJs } from '@/types'

export const animationRegister: CssInJs = {
  '@property --jumi-animation-composition': {
    'inherits': 'false',
    'initial-value': 'replace',
    'syntax': '"replace | add | accumulate"',
  },
  '@property --jumi-animation-delay': {
    'inherits': 'false',
    'initial-value': '0s',
    'syntax': '"<time>"',
  },
  '@property --jumi-animation-direction': {
    'inherits': 'false',
    'initial-value': 'normal',
    'syntax': '"normal | reverse | alternate | alternate-reverse"',
  },
  '@property --jumi-animation-duration': {
    'inherits': 'false',
    'initial-value': '1s',
    'syntax': '"<time>"',
  },
  '@property --jumi-animation-fill-mode': {
    'inherits': 'false',
    'initial-value': 'none',
    'syntax': '"none | forwards | backwards | both"',
  },
  '@property --jumi-animation-iteration-count': {
    'inherits': 'false',
    'initial-value': '1',
    'syntax': '"<number> | infinite"',
  },
  '@property --jumi-animation-play-state': {
    'inherits': 'false',
    'initial-value': 'running',
    'syntax': '"running | paused"',
  },
  '@property --jumi-animation-timing-function': {
    'inherits': 'false',
    'initial-value': 'ease',
    'syntax': '"ease | linear | ease-in | ease-out | ease-in-out | step-start | step-end"',
  },
} satisfies AnimationPropertyRegisterCollection
