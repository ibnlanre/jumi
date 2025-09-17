import type { AnimationKeyframes } from '@/types'

export const animationKeyframes: AnimationKeyframes = {
  '@keyframes back-in': {
    '0%': {
      transform: 'scale(0) rotateZ(-360deg)',
    },
    '100%': {
      transform: 'scale(1) rotateZ(0deg)',
    },
  },
  '@keyframes back-in-down': {
    '0%': {
      transform: 'scale(0) translateY(-2000px) rotateZ(-360deg)',
    },
    '100%': {
      transform: 'scale(1) translateY(0) rotateZ(0deg)',
    },
  },
  '@keyframes back-in-left': {
    '0%': {
      transform: 'scale(0) translateX(-2000px) rotateZ(-360deg)',
    },
    '100%': {
      transform: 'scale(1) translateX(0) rotateZ(0deg)',
    },
  },
  '@keyframes back-in-right': {
    '0%': {
      transform: 'scale(0) translateX(2000px) rotateZ(360deg)',
    },
    '100%': {
      transform: 'scale(1) translateX(0) rotateZ(0deg)',
    },
  },
  '@keyframes back-in-up': {
    '0%': {
      transform: 'scale(0) translateY(2000px) rotateZ(360deg)',
    },
    '100%': {
      transform: 'scale(1) translateY(0) rotateZ(0deg)',
    },
  },
  '@keyframes back-out': {
    '0%': {
      transform: 'scale(1) rotateZ(0deg)',
    },
    '100%': {
      transform: 'scale(0) rotateZ(360deg)',
    },
  },
  '@keyframes back-out-down': {
    '0%': {
      transform: 'scale(1) translateY(0) rotateZ(0deg)',
    },
    '100%': {
      transform: 'scale(0) translateY(2000px) rotateZ(360deg)',
    },
  },
  '@keyframes back-out-left': {
    '0%': {
      transform: 'scale(1) translateX(0) rotateZ(0deg)',
    },
    '100%': {
      transform: 'scale(0) translateX(-2000px) rotateZ(-360deg)',
    },
  },
  '@keyframes back-out-right': {
    '0%': {
      transform: 'scale(1) translateX(0) rotateZ(0deg)',
    },
    '100%': {
      transform: 'scale(0) translateX(2000px) rotateZ(360deg)',
    },
  },
  '@keyframes back-out-up': {
    '0%': {
      transform: 'scale(1) translateY(0) rotateZ(0deg)',
    },
    '100%': {
      transform: 'scale(0) translateY(-2000px) rotateZ(-360deg)',
    },
  },
  '@keyframes bounce-in': {
    '0%': {
      transform: 'scale3d(0.3, 0.3, 0.3)',
    },
    '20%': {
      transform: 'scale3d(1.1, 1.1, 1.1)',
    },
    '40%': {
      transform: 'scale3d(0.9, 0.9, 0.9)',
    },
    '60%': {
      transform: 'scale3d(1.03, 1.03, 1.03)',
    },
    '80%': {
      transform: 'scale3d(0.97, 0.97, 0.97)',
    },
    'from, 20%, 40%, 60%, 80%, to': {
      'animation-timing-function': 'cubic-bezier(0.215, 0.61, 0.355, 1)',
    },
    'to': {
      transform: 'scale3d(1, 1, 1)',
    },
  },
  '@keyframes bounce-out': {
    '20%': {
      transform: 'scale3d(0.9, 0.9, 0.9)',
    },
    '50%, 55%': {
      transform: 'scale3d(1.1, 1.1, 1.1)',
    },
    'to': {
      transform: 'scale3d(0.3, 0.3, 0.3)',
    },
  },
  '@keyframes fade-down': {
    from: {
      opacity: '0',
      transform: 'translate3d(0, -40px, 0)',
    },
    to: {
      opacity: '1',
      transform: 'translate3d(0, 0, 0)',
    },
  },
  '@keyframes fade-down-left': {
    from: {
      opacity: '0',
      transform: 'translate3d(-40px, -40px, 0)',
    },
    to: {
      opacity: '1',
      transform: 'translate3d(0, 0, 0)',
    },
  },
  '@keyframes fade-down-right': {
    from: {
      opacity: '0',
      transform: 'translate3d(40px, -40px, 0)',
    },
    to: {
      opacity: '1',
      transform: 'translate3d(0, 0, 0)',
    },
  },
  '@keyframes fade-in': {
    from: {
      opacity: '0',
    },
    to: {
      opacity: '1',
    },
  },
  '@keyframes fade-left': {
    from: {
      opacity: '0',
      transform: 'translate3d(-40px, 0, 0)',
    },
    to: {
      opacity: '1',
      transform: 'translate3d(0, 0, 0)',
    },
  },
  '@keyframes fade-out': {
    from: {
      opacity: '1',
    },
    to: {
      opacity: '0',
    },
  },
  '@keyframes fade-right': {
    from: {
      opacity: '0',
      transform: 'translate3d(40px, 0, 0)',
    },
    to: {
      opacity: '1',
      transform: 'translate3d(0, 0, 0)',
    },
  },
  '@keyframes fade-up': {
    from: {
      opacity: '0',
      transform: 'translate3d(0, 40px, 0)',
    },
    to: {
      opacity: '1',
      transform: 'translate3d(0, 0, 0)',
    },
  },
  '@keyframes fade-up-left': {
    from: {
      opacity: '0',
      transform: 'translate3d(-40px, 40px, 0)',
    },
    to: {
      opacity: '1',
      transform: 'translate3d(0, 0, 0)',
    },
  },
  '@keyframes fade-up-right': {
    from: {
      opacity: '0',
      transform: 'translate3d(40px, 40px, 0)',
    },
    to: {
      opacity: '1',
      transform: 'translate3d(0, 0, 0)',
    },
  },
  '@keyframes flip-down': {
    '40%': {
      'animation-timing-function': 'ease-in',
      'transform': 'perspective(400px) rotateX(20deg)',
    },
    '60%': {
      opacity: '1',
      transform: 'perspective(400px) rotateX(-10deg)',
    },
    '80%': {
      transform: 'perspective(400px) rotateX(5deg)',
    },
    'from': {
      'animation-timing-function': 'ease-in',
      'opacity': '0',
      'transform': 'perspective(400px) rotateX(-90deg)',
    },
    'to': {
      transform: 'perspective(400px)',
    },
  },
  '@keyframes flip-left': {
    '40%': {
      'animation-timing-function': 'ease-in',
      'transform': 'perspective(400px) rotateY(20deg)',
    },
    '60%': {
      opacity: '1',
      transform: 'perspective(400px) rotateY(-10deg)',
    },
    '80%': {
      transform: 'perspective(400px) rotateY(5deg)',
    },
    'from': {
      'animation-timing-function': 'ease-in',
      'opacity': '0',
      'transform': 'perspective(400px) rotateY(-90deg)',
    },
    'to': {
      transform: 'perspective(400px)',
    },
  },
  '@keyframes flip-right': {
    '40%': {
      'animation-timing-function': 'ease-in',
      'transform': 'perspective(400px) rotateY(-20deg)',
    },
    '60%': {
      opacity: '1',
      transform: 'perspective(400px) rotateY(10deg)',
    },
    '80%': {
      transform: 'perspective(400px) rotateY(-5deg)',
    },
    'from': {
      'animation-timing-function': 'ease-in',
      'opacity': '0',
      'transform': 'perspective(400px) rotateY(90deg)',
    },
    'to': {
      transform: 'perspective(400px)',
    },
  },
  '@keyframes flip-up': {
    '40%': {
      'animation-timing-function': 'ease-in',
      'transform': 'perspective(400px) rotateX(-20deg)',
    },
    '60%': {
      opacity: '1',
      transform: 'perspective(400px) rotateX(10deg)',
    },
    '80%': {
      transform: 'perspective(400px) rotateX(-5deg)',
    },
    'from': {
      'animation-timing-function': 'ease-in',
      'opacity': '0',
      'transform': 'perspective(400px) rotateX(90deg)',
    },
    'to': {
      transform: 'perspective(400px)',
    },
  },
  '@keyframes flip-x': {
    '40%': {
      'animation-timing-function': 'ease-in',
      'transform': 'perspective(400px) rotateX(-20deg)',
    },
    '60%': {
      transform: 'perspective(400px) rotateX(10deg)',
    },
    '80%': {
      transform: 'perspective(400px) rotateX(-5deg)',
    },
    'from': {
      'animation-timing-function': 'ease-in',
      'transform': 'perspective(400px) rotateX(-90deg)',
    },
    'to': {
      transform: 'perspective(400px) rotateX(0deg)',
    },
  },
  '@keyframes flip-y': {
    '40%': {
      'animation-timing-function': 'ease-in',
      'transform': 'perspective(400px) rotateY(-20deg)',
    },
    '60%': {
      transform: 'perspective(400px) rotateY(10deg)',
    },
    '80%': {
      transform: 'perspective(400px) rotateY(-5deg)',
    },
    'from': {
      'animation-timing-function': 'ease-in',
      'transform': 'perspective(400px) rotateY(-90deg)',
    },
    'to': {
      transform: 'perspective(400px) rotateY(0deg)',
    },
  },
  '@keyframes heart-beat': {
    '14%': {
      transform: 'scale3d(1.3, 1.3, 1.3)',
    },
    '28%': {
      transform: 'scale3d(1, 1, 1)',
    },
    '42%': {
      transform: 'scale3d(1.3, 1.3, 1.3)',
    },
    '70%': {
      transform: 'scale3d(1, 1, 1)',
    },
    'from': {
      transform: 'scale3d(1, 1, 1)',
    },
  },
  '@keyframes jello': {
    '11.1%': {
      transform: 'skewX(-12.5deg) skewY(-12.5deg)',
    },
    '22.2%': {
      transform: 'skewX(6.25deg) skewY(6.25deg)',
    },
    '33.3%': {
      transform: 'skewX(-3.125deg) skewY(-3.125deg)',
    },
    '44.4%': {
      transform: 'skewX(1.5625deg) skewY(1.5625deg)',
    },
    '55.5%': {
      transform: 'skewX(-0.78125deg) skewY(-0.78125deg)',
    },
    '66.6%': {
      transform: 'skewX(0.390625deg) skewY(0.390625deg)',
    },
    '77.7%': {
      transform: 'skewX(-0.1953125deg) skewY(-0.1953125deg)',
    },
    '88.8%': {
      transform: 'skewX(0.09765625deg) skewY(0.09765625deg)',
    },
    'from': {
      transform: 'none',
    },
    'to': {
      transform: 'none',
    },
  },
  '@keyframes pulsate': {
    '50%': {
      transform: 'scale3d(1.05, 1.05, 1.05)',
    },
    'from': {
      transform: 'scale3d(1, 1, 1)',
    },
    'to': {
      transform: 'scale3d(1, 1, 1)',
    },
  },
  '@keyframes shake': {
    '10%, 30%, 50%, 70%, 90%': {
      transform: 'translate3d(-10px, 0, 0)',
    },
    '20%, 40%, 60%, 80%': {
      transform: 'translate3d(10px, 0, 0)',
    },
    'from, to': {
      transform: 'translate3d(0, 0, 0)',
    },
  },
  '@keyframes slide-in-down': {
    from: {
      transform: 'translate3d(0, -100%, 0)',
      visibility: 'visible',
    },
    to: {
      transform: 'translate3d(0, 0, 0)',
    },
  },
  '@keyframes slide-in-left': {
    from: {
      transform: 'translate3d(-100%, 0, 0)',
      visibility: 'visible',
    },
    to: {
      transform: 'translate3d(0, 0, 0)',
    },
  },
  '@keyframes slide-in-right': {
    from: {
      transform: 'translate3d(100%, 0, 0)',
      visibility: 'visible',
    },
    to: {
      transform: 'translate3d(0, 0, 0)',
    },
  },
  '@keyframes slide-in-up': {
    from: {
      transform: 'translate3d(0, 100%, 0)',
      visibility: 'visible',
    },
    to: {
      transform: 'translate3d(0, 0, 0)',
    },
  },
  '@keyframes swing': {
    '20%': {
      transform: 'rotateZ(15deg)',
    },
    '40%': {
      transform: 'rotateZ(-10deg)',
    },
    '60%': {
      transform: 'rotateZ(5deg)',
    },
    '80%': {
      transform: 'rotateZ(-5deg)',
    },
    'to': {
      transform: 'rotateZ(0deg)',
    },
  },
  '@keyframes tada': {
    '10%, 20%': {
      transform: 'scale3d(0.9, 0.9, 0.9) rotateZ(-3deg)',
    },
    '30%, 50%, 70%, 90%': {
      transform: 'scale3d(1.1, 1.1, 1.1) rotateZ(3deg)',
    },
    '40%, 60%, 80%': {
      transform: 'scale3d(0.9, 0.9, 0.9) rotateZ(-3deg)',
    },
    'from': {
      transform: 'scale3d(1, 1, 1)',
    },
    'to': {
      transform: 'scale3d(1, 1, 1)',
    },
  },
  '@keyframes wobble': {
    '15%': {
      transform: 'translate3d(-25%, 0, 0) rotateZ(-5deg)',
    },
    '30%': {
      transform: 'translate3d(20%, 0, 0) rotateZ(3deg)',
    },
    '45%': {
      transform: 'translate3d(-15%, 0, 0) rotateZ(-3deg)',
    },
    '60%': {
      transform: 'translate3d(10%, 0, 0) rotateZ(2deg)',
    },
    '75%': {
      transform: 'translate3d(-5%, 0, 0) rotateZ(-1deg)',
    },
    'from': {
      transform: 'translate3d(0, 0, 0)',
    },
    'to': {
      transform: 'translate3d(0, 0, 0)',
    },
  },
  '@keyframes zoom-in': {
    '50%': {
      transform: 'scale3d(1.05, 1.05, 1.05)',
    },
    'from': {
      transform: 'scale3d(0.3, 0.3, 0.3)',
    },
    'to': {
      transform: 'scale3d(1, 1, 1)',
    },
  },
  '@keyframes zoom-in-down': {
    '50%': {
      transform: 'scale3d(1.05, 1.05, 1.05) translate3d(0, 60%, 0)',
    },
    'from': {
      transform: 'scale3d(0.3, 0.3, 0.3) translate3d(0, -100%, 0)',
    },
    'to': {
      transform: 'scale3d(1, 1, 1) translate3d(0, 0, 0)',
    },
  },
  '@keyframes zoom-in-left': {
    '50%': {
      transform: 'scale3d(1.05, 1.05, 1.05) translate3d(60%, 0, 0)',
    },
    'from': {
      transform: 'scale3d(0.3, 0.3, 0.3) translate3d(-100%, 0, 0)',
    },
    'to': {
      transform: 'scale3d(1, 1, 1) translate3d(0, 0, 0)',
    },
  },
  '@keyframes zoom-in-right': {
    '50%': {
      transform: 'scale3d(1.05, 1.05, 1.05) translate3d(-60%, 0, 0)',
    },
    'from': {
      transform: 'scale3d(0.3, 0.3, 0.3) translate3d(100%, 0, 0)',
    },
    'to': {
      transform: 'scale3d(1, 1, 1) translate3d(0, 0, 0)',
    },
  },
  '@keyframes zoom-in-up': {
    '50%': {
      transform: 'scale3d(1.05, 1.05, 1.05) translate3d(0, -60%, 0)',
    },
    'from': {
      transform: 'scale3d(0.3, 0.3, 0.3) translate3d(0, 100%, 0)',
    },
    'to': {
      transform: 'scale3d(1, 1, 1) translate3d(0, 0, 0)',
    },
  },
  '@keyframes zoom-out': {
    '50%': {
      transform: 'scale3d(0.95, 0.95, 0.95)',
    },
    'from': {
      transform: 'scale3d(1, 1, 1)',
    },
    'to': {
      transform: 'scale3d(0.3, 0.3, 0.3)',
    },
  },
  '@keyframes zoom-out-down': {
    '50%': {
      transform: 'scale3d(0.95, 0.95, 0.95) translate3d(0, 60%, 0)',
    },
    'from': {
      transform: 'scale3d(1, 1, 1) translate3d(0, 0, 0)',
    },
    'to': {
      transform: 'scale3d(0.3, 0.3, 0.3) translate3d(0, 100%, 0)',
    },
  },
  '@keyframes zoom-out-left': {
    '50%': {
      transform: 'scale3d(0.95, 0.95, 0.95) translate3d(-60%, 0, 0)',
    },
    'from': {
      transform: 'scale3d(1, 1, 1) translate3d(0, 0, 0)',
    },
    'to': {
      transform: 'scale3d(0.3, 0.3, 0.3) translate3d(-100%, 0, 0)',
    },
  },
  '@keyframes zoom-out-right': {
    '50%': {
      transform: 'scale3d(0.95, 0.95, 0.95) translate3d(60%, 0, 0)',
    },
    'from': {
      transform: 'scale3d(1, 1, 1) translate3d(0, 0, 0)',
    },
    'to': {
      transform: 'scale3d(0.3, 0.3, 0.3) translate3d(100%, 0, 0)',
    },
  },
  '@keyframes zoom-out-up': {
    '50%': {
      transform: 'scale3d(0.95, 0.95, 0.95) translate3d(0, -60%, 0)',
    },
    'from': {
      transform: 'scale3d(1, 1, 1) translate3d(0, 0, 0)',
    },
    'to': {
      transform: 'scale3d(0.3, 0.3, 0.3) translate3d(0, -100%, 0)',
    },
  },
}
