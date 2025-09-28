const backEffect = {
  'back-in': {
    '@keyframes jumi-back-in': {
      '0%': {
        transform: 'scale(0) rotateZ(-360deg)',
      },
      '100%': {
        transform: 'scale(1) rotateZ(0deg)',
      },
    },
  },
  'back-in-down': {
    '@keyframes jumi-back-in-down': {
      '0%': {
        transform: 'scale(0) translateY(-2000px) rotateZ(-360deg)',
      },
      '100%': {
        transform: 'scale(1) translateY(0) rotateZ(0deg)',
      },
    },
  },
  'back-in-left': {
    '@keyframes jumi-back-in-left': {
      '0%': {
        transform: 'scale(0) translateX(-2000px) rotateZ(-360deg)',
      },
      '100%': {
        transform: 'scale(1) translateX(0) rotateZ(0deg)',
      },
    },
  },
  'back-in-right': {
    '@keyframes jumi-back-in-right': {
      '0%': {
        transform: 'scale(0) translateX(2000px) rotateZ(360deg)',
      },
      '100%': {
        transform: 'scale(1) translateX(0) rotateZ(0deg)',
      },
    },
  },
  'back-in-up': {
    '@keyframes jumi-back-in-up': {
      '0%': {
        transform: 'scale(0) translateY(2000px) rotateZ(360deg)',
      },
      '100%': {
        transform: 'scale(1) translateY(0) rotateZ(0deg)',
      },
    },
  },
  'back-out': {
    '@keyframes jumi-back-out': {
      '0%': {
        transform: 'scale(1) rotateZ(0deg)',
      },
      '100%': {
        transform: 'scale(0) rotateZ(360deg)',
      },
    },
  },
  'back-out-down': {
    '@keyframes jumi-back-out-down': {
      '0%': {
        transform: 'scale(1) translateY(0) rotateZ(0deg)',
      },
      '100%': {
        transform: 'scale(0) translateY(2000px) rotateZ(360deg)',
      },
    },
  },
  'back-out-left': {
    '@keyframes jumi-back-out-left': {
      '0%': {
        transform: 'scale(1) translateX(0) rotateZ(0deg)',
      },
      '100%': {
        transform: 'scale(0) translateX(-2000px) rotateZ(-360deg)',
      },
    },
  },
  'back-out-right': {
    '@keyframes jumi-back-out-right': {
      '0%': {
        transform: 'scale(1) translateX(0) rotateZ(0deg)',
      },
      '100%': {
        transform: 'scale(0) translateX(2000px) rotateZ(360deg)',
      },
    },
  },
  'back-out-up': {
    '@keyframes jumi-back-out-up': {
      '0%': {
        transform: 'scale(1) translateY(0) rotateZ(0deg)',
      },
      '100%': {
        transform: 'scale(0) translateY(-2000px) rotateZ(-360deg)',
      },
    },
  },
}

const bounceEffect = {
  'bounce-in': {
    '@keyframes jumi-bounce-in': {
      '0%': {
        transform: 'scale3d(0.8, 0.8, 0.8)',
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
  },
  'bounce-out': {
    '@keyframes jumi-bounce-out': {
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
  },
}

const fadeEffect = {
  'fade-down': {
    '@keyframes jumi-fade-down': {
      from: {
        opacity: '0',
        transform: 'translate3d(0, -40px, 0)',
      },
      to: {
        opacity: '1',
        transform: 'translate3d(0, 0, 0)',
      },
    },
  },
  'fade-down-left': {
    '@keyframes jumi-fade-down-left': {
      from: {
        opacity: '0',
        transform: 'translate3d(-40px, -40px, 0)',
      },
      to: {
        opacity: '1',
        transform: 'translate3d(0, 0, 0)',
      },
    },
  },
  'fade-down-right': {
    '@keyframes jumi-fade-down-right': {
      from: {
        opacity: '0',
        transform: 'translate3d(40px, -40px, 0)',
      },
      to: {
        opacity: '1',
        transform: 'translate3d(0, 0, 0)',
      },
    },
  },
  'fade-in': {
    '@keyframes jumi-fade-in': {
      from: {
        opacity: '0',
      },
      to: {
        opacity: '1',
      },
    },
  },
  'fade-left': {
    '@keyframes jumi-fade-left': {
      from: {
        opacity: '0',
        transform: 'translate3d(-40px, 0, 0)',
      },
      to: {
        opacity: '1',
        transform: 'translate3d(0, 0, 0)',
      },
    },
  },
  'fade-out': {
    '@keyframes jumi-fade-out': {
      from: {
        opacity: '1',
      },
      to: {
        opacity: '0',
      },
    },
  },
  'fade-right': {
    '@keyframes jumi-fade-right': {
      from: {
        opacity: '0',
        transform: 'translate3d(40px, 0, 0)',
      },
      to: {
        opacity: '1',
        transform: 'translate3d(0, 0, 0)',
      },
    },
  },
  'fade-up': {
    '@keyframes jumi-fade-up': {
      from: {
        opacity: '0',
        transform: 'translate3d(0, 40px, 0)',
      },
      to: {
        opacity: '1',
        transform: 'translate3d(0, 0, 0)',
      },
    },
  },
  'fade-up-left': {
    '@keyframes jumi-fade-up-left': {
      from: {
        opacity: '0',
        transform: 'translate3d(-40px, 40px, 0)',
      },
      to: {
        opacity: '1',
        transform: 'translate3d(0, 0, 0)',
      },
    },
  },
  'fade-up-right': {
    '@keyframes jumi-fade-up-right': {
      from: {
        opacity: '0',
        transform: 'translate3d(40px, 40px, 0)',
      },
      to: {
        opacity: '1',
        transform: 'translate3d(0, 0, 0)',
      },
    },
  },
}

const flipEffect = {
  'flip-down': {
    '@keyframes jumi-flip-down': {
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
  },
  'flip-left': {
    '@keyframes jumi-flip-left': {
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
  },
  'flip-right': {
    '@keyframes jumi-flip-right': {
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
  },
  'flip-up': {
    '@keyframes jumi-flip-up': {
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
  },
  'flip-x': {
    '@keyframes jumi-flip-x': {
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
  },
  'flip-y': {
    '@keyframes jumi-flip-y': {
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
  },
}

const revealEffect = {
  'reveal-bottom': {
    '@keyframes jumi-reveal-bottom': {
      from: {
        'bottom': 0,
        'inset-inline': 0,
        'width': '100%',
      },
      to: {
        width: '0%',
      },
    },
  },
  'reveal-left': {
    '@keyframes jumi-reveal-left': {
      from: {
        'inset-block': 0,
        'left': 0,
        'width': '0%',
      },
      to: {
        width: '100%',
      },
    },
  },
  'reveal-right': {
    '@keyframes jumi-reveal-right': {
      from: {
        'inset-block': 0,
        'right': 0,
        'width': '0%',
      },
      to: {
        width: '100%',
      },
    },
  },
  'reveal-top': {
    '@keyframes jumi-reveal-top': {
      from: {
        'height': '0%',
        'inset-inline': 0,
        'top': 0,
      },
      to: {
        height: '100%',
      },
    },
  },
}

const slideEffect = {
  'slide-in-down': {
    '@keyframes jumi-slide-in-down': {
      from: {
        transform: 'translate3d(0, -100%, 0)',
        visibility: 'visible',
      },
      to: {
        transform: 'translate3d(0, 0, 0)',
      },
    },
  },
  'slide-in-left': {
    '@keyframes jumi-slide-in-left': {
      from: {
        transform: 'translate3d(-100%, 0, 0)',
        visibility: 'visible',
      },
      to: {
        transform: 'translate3d(0, 0, 0)',
      },
    },
  },
  'slide-in-right': {
    '@keyframes jumi-slide-in-right': {
      from: {
        transform: 'translate3d(100%, 0, 0)',
        visibility: 'visible',
      },
      to: {
        transform: 'translate3d(0, 0, 0)',
      },
    },
  },
  'slide-in-up': {
    '@keyframes jumi-slide-in-up': {
      from: {
        transform: 'translate3d(0, 100%, 0)',
        visibility: 'visible',
      },
      to: {
        transform: 'translate3d(0, 0, 0)',
      },
    },
  },
}

const zoomEffect = {
  'zoom-in': {
    '@keyframes jumi-zoom-in': {
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
  },
  'zoom-in-down': {
    '@keyframes jumi-zoom-in-down': {
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
  },
  'zoom-in-left': {
    '@keyframes jumi-zoom-in-left': {
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
  },
  'zoom-in-right': {
    '@keyframes jumi-zoom-in-right': {
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
  },
  'zoom-in-up': {
    '@keyframes jumi-zoom-in-up': {
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
  },
  'zoom-out': {
    '@keyframes jumi-zoom-out': {
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
  },
  'zoom-out-down': {
    '@keyframes jumi-zoom-out-down': {
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
  },
  'zoom-out-left': {
    '@keyframes jumi-zoom-out-left': {
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
  },
  'zoom-out-right': {
    '@keyframes jumi-zoom-out-right': {
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
  },
  'zoom-out-up': {
    '@keyframes jumi-zoom-out-up': {
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
  },
}

const powerEffect = {
  'power-off': {
    '@keyframes jumi-power-off': {
      '0%': {
        transform: 'scale3d(1, 1, 1)',
      },
      '100%': {
        opacity: '0',
        transform: 'scale3d(0.1, 0.002, 1)',
      },
    },
  },
  'power-on': {
    '@keyframes jumi-power-on': {
      '0%': {
        opacity: '0',
        transform: 'scale3d(0.1, 0.002, 1)',
      },
      '100%': {
        transform: 'scale3d(1, 1, 1)',
      },
    },
  },
}

const frameEffect = {
  'frame-in': {
    '@keyframes jumi-frame-in': {
      '0%': {
        'clip-path': 'polygon(0 40%, 100% 40%, 100% 60%, 0 60%)',
      },
      '100%': {
        'clip-path': 'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
      },
    },
  },
  'frame-in-bottom': {
    '@keyframes jumi-frame-in-bottom': {
      '0%': {
        'clip-path': 'polygon(0 100%, 100% 100%, 100% 100%, 0 100%)',
      },
      '100%': {
        'clip-path': 'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
      },
    },
  },
  'frame-in-bottom-left': {
    '@keyframes jumi-frame-in-bottom-left': {
      '0%': {
        'clip-path': 'polygon(0 100%, 0 100%, 0 100%, 0 100%)',
      },
      '100%': {
        'clip-path': 'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
      },
    },
  },
  'frame-in-bottom-right': {
    '@keyframes jumi-frame-in-bottom-right': {
      '0%': {
        'clip-path': 'polygon(100% 100%, 100% 100%, 100% 100%, 100% 100%)',
      },
      '100%': {
        'clip-path': 'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
      },
    },
  },
  'frame-in-left': {
    '@keyframes jumi-frame-in-left': {
      '0%': {
        'clip-path': 'polygon(0 0, 0 0, 0 100%, 0 100%)',
      },
      '100%': {
        'clip-path': 'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
      },
    },
  },
  'frame-in-right': {
    '@keyframes jumi-frame-in-right': {
      '0%': {
        'clip-path': 'polygon(100% 0, 100% 0, 100% 100%, 100% 100%)',
      },
      '100%': {
        'clip-path': 'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
      },
    },
  },
  'frame-in-top': {
    '@keyframes jumi-frame-in-top': {
      '0%': {
        'clip-path': 'polygon(0 0, 100% 0, 100% 0, 0 0)',
      },
      '100%': {
        'clip-path': 'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
      },
    },
  },
  'frame-in-top-left': {
    '@keyframes jumi-frame-in-top-left': {
      '0%': {
        'clip-path': 'polygon(0 0, 0 0, 0 0, 0 0)',
      },
      '100%': {
        'clip-path': 'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
      },
    },
  },
  'frame-in-top-right': {
    '@keyframes jumi-frame-in-top-right': {
      '0%': {
        'clip-path': 'polygon(100% 0, 100% 0, 100% 0, 100% 0)',
      },
      '100%': {
        'clip-path': 'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
      },
    },
  },
  'frame-out': {
    '@keyframes jumi-frame-out': {
      '0%': {
        'clip-path': 'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
      },
      '100%': {
        'clip-path': 'polygon(0 40%, 100% 40%, 100% 60%, 0 60%)',
      },
    },
  },
  'frame-out-bottom': {
    '@keyframes jumi-frame-out-bottom': {
      '0%': {
        'clip-path': 'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
      },
      '100%': {
        'clip-path': 'polygon(0 100%, 100% 100%, 100% 100%, 0 100%)',
      },
    },
  },
  'frame-out-bottom-left': {
    '@keyframes jumi-frame-out-bottom-left': {
      '0%': {
        'clip-path': 'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
      },
      '100%': {
        'clip-path': 'polygon(0 100%, 0 100%, 0 100%, 0 100%)',
      },
    },
  },
  'frame-out-bottom-right': {
    '@keyframes jumi-frame-out-bottom-right': {
      '0%': {
        'clip-path': 'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
      },
      '100%': {
        'clip-path': 'polygon(100% 100%, 100% 100%, 100% 100%, 100% 100%)',
      },
    },
  },
  'frame-out-left': {
    '@keyframes jumi-frame-out-left': {
      '0%': {
        'clip-path': 'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
      },
      '100%': {
        'clip-path': 'polygon(0 0, 0 0, 0 100%, 0 100%)',
      },
    },
  },
  'frame-out-right': {
    '@keyframes jumi-frame-out-right': {
      '0%': {
        'clip-path': 'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
      },
      '100%': {
        'clip-path': 'polygon(100% 0, 100% 0, 100% 100%, 100% 100%)',
      },
    },
  },
  'frame-out-top': {
    '@keyframes jumi-frame-out-top': {
      '0%': {
        'clip-path': 'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
      },
      '100%': {
        'clip-path': 'polygon(0 0, 100% 0, 100% 0, 0 0)',
      },
    },
  },
  'frame-out-top-left': {
    '@keyframes jumi-frame-out-top-left': {
      '0%': {
        'clip-path': 'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
      },
      '100%': {
        'clip-path': 'polygon(0 0, 0 0, 0 0, 0 0)',
      },
    },
  },
  'frame-out-top-right': {
    '@keyframes jumi-frame-out-top-right': {
      '0%': {
        'clip-path': 'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
      },
      '100%': {
        'clip-path': 'polygon(100% 0, 100% 0, 100% 0, 100% 0)',
      },
    },
  },
}

const circleEffect = {
  'circle-in': {
    '@keyframes jumi-circle-in': {
      '0%': {
        'clip-path': 'circle(0% at 50% 50%)',
      },
      '100%': {
        'clip-path': 'circle(100% at 50% 50%)',
      },
    },
  },
  'circle-in-bottom-left': {
    '@keyframes jumi-circle-in-bottom-left': {
      '0%': {
        'clip-path': 'circle(0% at 0% 100%)',
      },
      '100%': {
        'clip-path': 'circle(150% at 0% 100%)',
      },
    },
  },
  'circle-in-bottom-right': {
    '@keyframes jumi-circle-in-bottom-right': {
      '0%': {
        'clip-path': 'circle(0% at 100% 100%)',
      },
      '100%': {
        'clip-path': 'circle(150% at 100% 100%)',
      },
    },
  },
  'circle-in-top-left': {
    '@keyframes jumi-circle-in-top-left': {
      '0%': {
        'clip-path': 'circle(0% at 0% 0%)',
      },
      '100%': {
        'clip-path': 'circle(150% at 0% 0%)',
      },
    },
  },
  'circle-in-top-right': {
    '@keyframes jumi-circle-in-top-right': {
      '0%': {
        'clip-path': 'circle(0% at 100% 0%)',
      },
      '100%': {
        'clip-path': 'circle(150% at 100% 0%)',
      },
    },
  },
  'circle-out': {
    '@keyframes jumi-circle-out': {
      '0%': {
        'clip-path': 'circle(100% at 50% 50%)',
      },
      '100%': {
        'clip-path': 'circle(0% at 50% 50%)',
      },
    },
  },
  'circle-out-bottom-left': {
    '@keyframes jumi-circle-out-bottom-left': {
      '0%': {
        'clip-path': 'circle(150% at 0% 100%)',
      },
      '100%': {
        'clip-path': 'circle(0% at 0% 100%)',
      },
    },
  },
  'circle-out-bottom-right': {
    '@keyframes jumi-circle-out-bottom-right': {
      '0%': {
        'clip-path': 'circle(150% at 100% 100%)',
      },
      '100%': {
        'clip-path': 'circle(0% at 100% 100%)',
      },
    },
  },
  'circle-out-top-left': {
    '@keyframes jumi-circle-out-top-left': {
      '0%': {
        'clip-path': 'circle(150% at 0% 0%)',
      },
      '100%': {
        'clip-path': 'circle(0% at 0% 0%)',
      },
    },
  },
  'circle-out-top-right': {
    '@keyframes jumi-circle-out-top-right': {
      '0%': {
        'clip-path': 'circle(150% at 100% 0%)',
      },
      '100%': {
        'clip-path': 'circle(0% at 100% 0%)',
      },
    },
  },
}

const squareEffect = {
  'square-in': {
    '@keyframes jumi-square-in': {
      '0%': {
        'clip-path': 'polygon(50% 50%, 50% 50%, 50% 50%, 50% 50%)',
      },
      '100%': {
        'clip-path': 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
      },
    },
  },
  'square-in-bottom-left': {
    '@keyframes jumi-square-in-bottom-left': {
      '0%': {
        'clip-path': 'polygon(0% 100%, 0% 100%, 0% 100%, 0% 100%)',
      },
      '100%': {
        'clip-path': 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
      },
    },
  },
  'square-in-bottom-right': {
    '@keyframes jumi-square-in-bottom-right': {
      '0%': {
        'clip-path': 'polygon(100% 100%, 100% 100%, 100% 100%, 100% 100%)',
      },
      '100%': {
        'clip-path': 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
      },
    },
  },
  'square-in-top-left': {
    '@keyframes jumi-square-in-top-left': {
      '0%': {
        'clip-path': 'polygon(0% 0%, 0% 0%, 0% 0%, 0% 0%)',
      },
      '100%': {
        'clip-path': 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
      },
    },
  },
  'square-in-top-right': {
    '@keyframes jumi-square-in-top-right': {
      '0%': {
        'clip-path': 'polygon(100% 0%, 100% 0%, 100% 0%, 100% 0%)',
      },
      '100%': {
        'clip-path': 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
      },
    },
  },
  'square-out': {
    '@keyframes jumi-square-out': {
      '0%': {
        'clip-path': 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
      },
      '100%': {
        'clip-path': 'polygon(50% 50%, 50% 50%, 50% 50%, 50% 50%)',
      },
    },
  },
  'square-out-bottom-left': {
    '@keyframes jumi-square-out-bottom-left': {
      '0%': {
        'clip-path': 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
      },
      '100%': {
        'clip-path': 'polygon(0% 100%, 0% 100%, 0% 100%, 0% 100%)',
      },
    },
  },
  'square-out-bottom-right': {
    '@keyframes jumi-square-out-bottom-right': {
      '0%': {
        'clip-path': 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
      },
      '100%': {
        'clip-path': 'polygon(100% 100%, 100% 100%, 100% 100%, 100% 100%)',
      },
    },
  },
  'square-out-top-left': {
    '@keyframes jumi-square-out-top-left': {
      '0%': {
        'clip-path': 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
      },
      '100%': {
        'clip-path': 'polygon(0% 0%, 0% 0%, 0% 0%, 0% 0%)',
      },
    },
  },
  'square-out-top-right': {
    '@keyframes jumi-square-out-top-right': {
      '0%': {
        'clip-path': 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
      },
      '100%': {
        'clip-path': 'polygon(100% 0%, 100% 0%, 100% 0%, 100% 0%)',
      },
    },
  },
}

const triangleEffect = {
  'triangle-in': {
    '@keyframes jumi-triangle-in': {
      '0%': {
        'clip-path': 'polygon(50% 50%, 50% 50%, 50% 50%)',
      },
      '100%': {
        'clip-path': 'polygon(50% 0%, 100% 100%, 0% 100%)',
      },
    },
  },
  'triangle-in-bottom-left': {
    '@keyframes jumi-triangle-in-bottom-left': {
      '0%': {
        'clip-path': 'polygon(0% 100%, 0% 100%, 0% 100%)',
      },
      '100%': {
        'clip-path': 'polygon(0% 0%, 100% 0%, 100% 100%)',
      },
    },
  },
  'triangle-in-bottom-right': {
    '@keyframes jumi-triangle-in-bottom-right': {
      '0%': {
        'clip-path': 'polygon(100% 100%, 100% 100%, 100% 100%)',
      },
      '100%': {
        'clip-path': 'polygon(0% 0%, 100% 0%, 0% 100%)',
      },
    },
  },
  'triangle-in-top-left': {
    '@keyframes jumi-triangle-in-top-left': {
      '0%': {
        'clip-path': 'polygon(0% 0%, 0% 0%, 0% 0%)',
      },
      '100%': {
        'clip-path': 'polygon(0% 0%, 100% 100%, 0% 100%)',
      },
    },
  },
  'triangle-in-top-right': {
    '@keyframes jumi-triangle-in-top-right': {
      '0%': {
        'clip-path': 'polygon(100% 0%, 100% 0%, 100% 0%)',
      },
      '100%': {
        'clip-path': 'polygon(0% 0%, 100% 0%, 50% 100%)',
      },
    },
  },
  'triangle-out': {
    '@keyframes jumi-triangle-out': {
      '0%': {
        'clip-path': 'polygon(50% 0%, 100% 100%, 0% 100%)',
      },
      '100%': {
        'clip-path': 'polygon(50% 50%, 50% 50%, 50% 50%)',
      },
    },
  },
  'triangle-out-bottom-left': {
    '@keyframes jumi-triangle-out-bottom-left': {
      '0%': {
        'clip-path': 'polygon(0% 0%, 100% 0%, 100% 100%)',
      },
      '100%': {
        'clip-path': 'polygon(0% 100%, 0% 100%, 0% 100%)',
      },
    },
  },
  'triangle-out-bottom-right': {
    '@keyframes jumi-triangle-out-bottom-right': {
      '0%': {
        'clip-path': 'polygon(0% 0%, 100% 0%, 0% 100%)',
      },
      '100%': {
        'clip-path': 'polygon(100% 100%, 100% 100%, 100% 100%)',
      },
    },
  },
  'triangle-out-top-left': {
    '@keyframes jumi-triangle-out-top-left': {
      '0%': {
        'clip-path': 'polygon(0% 0%, 100% 100%, 0% 100%)',
      },
      '100%': {
        'clip-path': 'polygon(0% 0%, 0% 0%, 0% 0%)',
      },
    },
  },
  'triangle-out-top-right': {
    '@keyframes jumi-triangle-out-top-right': {
      '0%': {
        'clip-path': 'polygon(0% 0%, 100% 0%, 50% 100%)',
      },
      '100%': {
        'clip-path': 'polygon(100% 0%, 100% 0%, 100% 0%)',
      },
    },
  },
}

const diamondEffect = {
  'diamond-in': {
    '@keyframes jumi-diamond-in': {
      '0%': {
        'clip-path': 'polygon(50% 50%, 50% 50%, 50% 50%, 50% 50%)',
      },
      '100%': {
        'clip-path': 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
      },
    },
  },
  'diamond-out': {
    '@keyframes jumi-diamond-out': {
      '0%': {
        'clip-path': 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
      },
      '100%': {
        'clip-path': 'polygon(50% 50%, 50% 50%, 50% 50%, 50% 50%)',
      },
    },
  },
  'diamond-scale-in': {
    '@keyframes jumi-diamond-scale-in': {
      '0%': {
        'clip-path': 'polygon(50% 50%, 50% 50%, 50% 50%, 50% 50%)',
        'transform': 'scale(0.3)',
      },
      '100%': {
        'clip-path': 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
        'transform': 'scale(1)',
      },
    },
  },
  'diamond-scale-out': {
    '@keyframes jumi-diamond-scale-out': {
      '0%': {
        'clip-path': 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
        'transform': 'scale(1)',
      },
      '100%': {
        'clip-path': 'polygon(50% 50%, 50% 50%, 50% 50%, 50% 50%)',
        'transform': 'scale(0.3)',
      },
    },
  },
  'hexagon-in': {
    '@keyframes jumi-hexagon-in': {
      '0%': {
        'clip-path': 'polygon(50% 50%, 50% 50%, 50% 50%, 50% 50%, 50% 50%, 50% 50%)',
      },
      '100%': {
        'clip-path': 'polygon(30% 0%, 70% 0%, 100% 50%, 70% 100%, 30% 100%, 0% 50%)',
      },
    },
  },
  'hexagon-out': {
    '@keyframes jumi-hexagon-out': {
      '0%': {
        'clip-path': 'polygon(30% 0%, 70% 0%, 100% 50%, 70% 100%, 30% 100%, 0% 50%)',
      },
      '100%': {
        'clip-path': 'polygon(50% 50%, 50% 50%, 50% 50%, 50% 50%, 50% 50%, 50% 50%)',
      },
    },
  },
}

const movementEffect = {
  'fall-down': {
    '@keyframes jumi-fall-down': {
      '0%': {
        opacity: '1',
        transform: 'translateY(-100vh) scaleY(1)',
      },
      '75%': {
        transform: 'translateY(25px) scaleY(0.9)',
      },
      '100%': {
        transform: 'translateY(0) scaleY(1)',
      },
    },
  },
  'fall-left': {
    '@keyframes jumi-fall-left': {
      '0%': {
        opacity: '1',
        transform: 'translateX(-100vw) scaleX(1)',
      },
      '75%': {
        transform: 'translateX(25px) scaleX(0.9)',
      },
      '100%': {
        transform: 'translateX(0) scaleX(1)',
      },
    },
  },
  'fall-right': {
    '@keyframes jumi-fall-right': {
      '0%': {
        opacity: '1',
        transform: 'translateX(100vw) scaleX(1)',
      },
      '75%': {
        transform: 'translateX(-25px) scaleX(0.9)',
      },
      '100%': {
        transform: 'translateX(0) scaleX(1)',
      },
    },
  },
  'fall-up': {
    '@keyframes jumi-fall-up': {
      '0%': {
        opacity: '1',
        transform: 'translateY(100vh) scaleY(1)',
      },
      '75%': {
        transform: 'translateY(-25px) scaleY(0.9)',
      },
      '100%': {
        transform: 'translateY(0) scaleY(1)',
      },
    },
  },
  'float': {
    '@keyframes jumi-float': {
      '0%, 100%': {
        transform: 'translateY(0)',
      },
      '50%': {
        transform: 'translateY(-10px)',
      },
    },
  },
  'float-down': {
    '@keyframes jumi-float-down': {
      '0%': {
        opacity: '0',
        transform: 'translateY(-20px)',
      },
      '100%': {
        opacity: '1',
        transform: 'translateY(0)',
      },
    },
  },
  'float-left': {
    '@keyframes jumi-float-left': {
      '0%': {
        opacity: '0',
        transform: 'translateX(-20px)',
      },
      '100%': {
        opacity: '1',
        transform: 'translateX(0)',
      },
    },
  },
  'float-right': {
    '@keyframes jumi-float-right': {
      '0%': {
        opacity: '0',
        transform: 'translateX(20px)',
      },
      '100%': {
        opacity: '1',
        transform: 'translateX(0)',
      },
    },
  },
  'float-up': {
    '@keyframes jumi-float-up': {
      '0%': {
        opacity: '0',
        transform: 'translateY(20px)',
      },
      '100%': {
        opacity: '1',
        transform: 'translateY(0)',
      },
    },
  },
  'grow-down': {
    '@keyframes jumi-grow-down': {
      '0%': {
        opacity: '0',
        transform: 'translateY(-50px) scaleY(0)',
      },
      '100%': {
        opacity: '1',
        transform: 'translateY(0) scaleY(1)',
      },
    },
  },
  'grow-left': {
    '@keyframes jumi-grow-left': {
      '0%': {
        opacity: '0',
        transform: 'translateX(-50px) scaleX(0)',
      },
      '100%': {
        opacity: '1',
        transform: 'translateX(0) scaleX(1)',
      },
    },
  },
  'grow-right': {
    '@keyframes jumi-grow-right': {
      '0%': {
        opacity: '0',
        transform: 'translateX(50px) scaleX(0)',
      },
      '100%': {
        opacity: '1',
        transform: 'translateX(0) scaleX(1)',
      },
    },
  },
  'grow-up': {
    '@keyframes jumi-grow-up': {
      '0%': {
        opacity: '0',
        transform: 'translateY(50px) scaleY(0)',
      },
      '100%': {
        opacity: '1',
        transform: 'translateY(0) scaleY(1)',
      },
    },
  },
  'rush-down': {
    '@keyframes jumi-rush-down': {
      '0%': {
        opacity: '0',
        transform: 'translateY(-300px) scale(0.8)',
      },
      '60%': {
        opacity: '1',
        transform: 'translateY(30px) scale(1.1)',
      },
      '100%': {
        transform: 'translateY(0) scale(1)',
      },
    },
  },
  'rush-left': {
    '@keyframes jumi-rush-left': {
      '0%': {
        opacity: '0',
        transform: 'translateX(-300px) scale(0.8)',
      },
      '60%': {
        opacity: '1',
        transform: 'translateX(30px) scale(1.1)',
      },
      '100%': {
        transform: 'translateX(0) scale(1)',
      },
    },
  },
  'rush-right': {
    '@keyframes jumi-rush-right': {
      '0%': {
        opacity: '0',
        transform: 'translateX(300px) scale(0.8)',
      },
      '60%': {
        opacity: '1',
        transform: 'translateX(-30px) scale(1.1)',
      },
      '100%': {
        transform: 'translateX(0) scale(1)',
      },
    },
  },
  'rush-up': {
    '@keyframes jumi-rush-up': {
      '0%': {
        opacity: '0',
        transform: 'translateY(300px) scale(0.8)',
      },
      '60%': {
        opacity: '1',
        transform: 'translateY(-30px) scale(1.1)',
      },
      '100%': {
        transform: 'translateY(0) scale(1)',
      },
    },
  },
  'spring-down': {
    '@keyframes jumi-spring-down': {
      '0%': {
        opacity: '0',
        transform: 'translateY(-100px) scale(0.3)',
      },
      '50%': {
        opacity: '1',
        transform: 'translateY(0) scale(1.05)',
      },
      '70%': {
        transform: 'translateY(0) scale(0.9)',
      },
      '100%': {
        transform: 'translateY(0) scale(1)',
      },
    },
  },
  'spring-left': {
    '@keyframes jumi-spring-left': {
      '0%': {
        opacity: '0',
        transform: 'translateX(-100px) scale(0.3)',
      },
      '50%': {
        opacity: '1',
        transform: 'translateX(0) scale(1.05)',
      },
      '70%': {
        transform: 'translateX(0) scale(0.9)',
      },
      '100%': {
        transform: 'translateX(0) scale(1)',
      },
    },
  },
  'spring-right': {
    '@keyframes jumi-spring-right': {
      '0%': {
        opacity: '0',
        transform: 'translateX(100px) scale(0.3)',
      },
      '50%': {
        opacity: '1',
        transform: 'translateX(0) scale(1.05)',
      },
      '70%': {
        transform: 'translateX(0) scale(0.9)',
      },
      '100%': {
        transform: 'translateX(0) scale(1)',
      },
    },
  },
  'spring-up': {
    '@keyframes jumi-spring-up': {
      '0%': {
        opacity: '0',
        transform: 'translateY(100px) scale(0.3)',
      },
      '50%': {
        opacity: '1',
        transform: 'translateY(0) scale(1.05)',
      },
      '70%': {
        transform: 'translateY(0) scale(0.9)',
      },
      '100%': {
        transform: 'translateY(0) scale(1)',
      },
    },
  },
  'throw-down': {
    '@keyframes jumi-throw-down': {
      '0%': {
        opacity: '0',
        transform: 'translateY(-200px) rotate(-45deg) scale(0.5)',
      },
      '50%': {
        opacity: '1',
        transform: 'translateY(0) rotate(0deg) scale(1.1)',
      },
      '100%': {
        transform: 'translateY(0) rotate(0deg) scale(1)',
      },
    },
  },
  'throw-left': {
    '@keyframes jumi-throw-left': {
      '0%': {
        opacity: '0',
        transform: 'translateX(-200px) rotate(-45deg) scale(0.5)',
      },
      '50%': {
        opacity: '1',
        transform: 'translateX(0) rotate(0deg) scale(1.1)',
      },
      '100%': {
        transform: 'translateX(0) rotate(0deg) scale(1)',
      },
    },
  },
  'throw-right': {
    '@keyframes jumi-throw-right': {
      '0%': {
        opacity: '0',
        transform: 'translateX(200px) rotate(45deg) scale(0.5)',
      },
      '50%': {
        opacity: '1',
        transform: 'translateX(0) rotate(0deg) scale(1.1)',
      },
      '100%': {
        transform: 'translateX(0) rotate(0deg) scale(1)',
      },
    },
  },
  'throw-up': {
    '@keyframes jumi-throw-up': {
      '0%': {
        opacity: '0',
        transform: 'translateY(200px) rotate(45deg) scale(0.5)',
      },
      '50%': {
        opacity: '1',
        transform: 'translateY(0) rotate(0deg) scale(1.1)',
      },
      '100%': {
        transform: 'translateY(0) rotate(0deg) scale(1)',
      },
    },
  },
}

const spiralEffect = {
  'spiral-back-in': {
    '@keyframes jumi-spiral-back-in': {
      '0%': {
        opacity: '0',
        transform: 'rotate(-360deg) scale(0)',
      },
      '100%': {
        opacity: '1',
        transform: 'rotate(0deg) scale(1)',
      },
    },
  },
  'spiral-back-out': {
    '@keyframes jumi-spiral-back-out': {
      '0%': {
        opacity: '1',
        transform: 'rotate(0deg) scale(1)',
      },
      '100%': {
        opacity: '0',
        transform: 'rotate(-360deg) scale(0)',
      },
    },
  },
  'spiral-in': {
    '@keyframes jumi-spiral-in': {
      '0%': {
        opacity: '0',
        transform: 'rotate(360deg) scale(0)',
      },
      '100%': {
        opacity: '1',
        transform: 'rotate(0deg) scale(1)',
      },
    },
  },
  'spiral-out': {
    '@keyframes jumi-spiral-out': {
      '0%': {
        opacity: '1',
        transform: 'rotate(0deg) scale(1)',
      },
      '100%': {
        opacity: '0',
        transform: 'rotate(360deg) scale(0)',
      },
    },
  },
}

const transform3dEffect = {
  'flip-horizontal': {
    '@keyframes jumi-flip-horizontal': {
      '0%': {
        transform: 'rotateY(0deg)',
      },
      '100%': {
        transform: 'rotateY(180deg)',
      },
    },
  },
  'flip-vertical': {
    '@keyframes jumi-flip-vertical': {
      '0%': {
        transform: 'rotateX(0deg)',
      },
      '100%': {
        transform: 'rotateX(180deg)',
      },
    },
  },
  'flip-x-3d': {
    '@keyframes jumi-flip-x-3d': {
      '0%': {
        transform: 'perspective(1000px) rotateX(0deg)',
      },
      '100%': {
        transform: 'perspective(1000px) rotateX(180deg)',
      },
    },
  },
  'flip-y-3d': {
    '@keyframes jumi-flip-y-3d': {
      '0%': {
        transform: 'perspective(1000px) rotateY(0deg)',
      },
      '100%': {
        transform: 'perspective(1000px) rotateY(180deg)',
      },
    },
  },
  'morph': {
    '@keyframes jumi-morph': {
      '0%': {
        transform: 'scale(1) skew(0deg)',
      },
      '33%': {
        transform: 'scale(1.3, 0.7) skew(20deg)',
      },
      '66%': {
        transform: 'scale(0.7, 1.3) skew(-20deg)',
      },
      '100%': {
        transform: 'scale(1) skew(0deg)',
      },
    },
  },
  'rotate-left': {
    '@keyframes jumi-rotate-left': {
      '0%': {
        transform: 'rotate(0deg)',
      },
      '100%': {
        transform: 'rotate(-360deg)',
      },
    },
  },
  'rotate-right': {
    '@keyframes jumi-rotate-right': {
      '0%': {
        transform: 'rotate(0deg)',
      },
      '100%': {
        transform: 'rotate(360deg)',
      },
    },
  },
  'skew-in': {
    '@keyframes jumi-skew-in': {
      '0%': {
        opacity: '0',
        transform: 'skew(-20deg, -20deg)',
      },
      '100%': {
        opacity: '1',
        transform: 'skew(0deg, 0deg)',
      },
    },
  },
  'skew-out': {
    '@keyframes jumi-skew-out': {
      '0%': {
        opacity: '1',
        transform: 'skew(0deg, 0deg)',
      },
      '100%': {
        opacity: '0',
        transform: 'skew(-20deg, -20deg)',
      },
    },
  },
  'skew-x': {
    '@keyframes jumi-skew-x': {
      '0%': {
        transform: 'skewX(0deg)',
      },
      '100%': {
        transform: 'skewX(20deg)',
      },
    },
  },
  'skew-y': {
    '@keyframes jumi-skew-y': {
      '0%': {
        transform: 'skewY(0deg)',
      },
      '100%': {
        transform: 'skewY(20deg)',
      },
    },
  },
  'spin': {
    '@keyframes jumi-spin': {
      '0%': {
        transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg)',
      },
      '100%': {
        transform: 'perspective(1000px) rotateX(360deg) rotateY(360deg)',
      },
    },
  },
  'spin-left': {
    '@keyframes jumi-spin-left': {
      '0%': {
        transform: 'rotate(0deg)',
      },
      '100%': {
        transform: 'rotate(-360deg)',
      },
    },
  },
  'spin-reverse': {
    '@keyframes jumi-spin-reverse': {
      '0%': {
        transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg)',
      },
      '100%': {
        transform: 'perspective(1000px) rotateX(-360deg) rotateY(-360deg)',
      },
    },
  },
  'spin-right': {
    '@keyframes jumi-spin-right': {
      '0%': {
        transform: 'rotate(0deg)',
      },
      '100%': {
        transform: 'rotate(360deg)',
      },
    },
  },
  'spiral': {
    '@keyframes jumi-spiral': {
      '0%': {
        transform: 'rotate(0deg) scale(1)',
      },
      '50%': {
        transform: 'rotate(180deg) scale(0.5)',
      },
      '100%': {
        transform: 'rotate(360deg) scale(1)',
      },
    },
  },
  'spiral-in': {
    '@keyframes jumi-spiral-in': {
      '0%': {
        opacity: '0',
        transform: 'rotate(-360deg) scale(0)',
      },
      '100%': {
        opacity: '1',
        transform: 'rotate(0deg) scale(1)',
      },
    },
  },
  'spiral-out': {
    '@keyframes jumi-spiral-out': {
      '0%': {
        opacity: '1',
        transform: 'rotate(0deg) scale(1)',
      },
      '100%': {
        opacity: '0',
        transform: 'rotate(360deg) scale(0)',
      },
    },
  },
  'tilt': {
    '@keyframes jumi-tilt': {
      '0%': {
        transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg)',
      },
      '50%': {
        transform: 'perspective(1000px) rotateX(15deg) rotateY(15deg)',
      },
      '100%': {
        transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg)',
      },
    },
  },
  'twist': {
    '@keyframes jumi-twist': {
      '0%': {
        transform: 'rotate(0deg) scaleX(1)',
      },
      '25%': {
        transform: 'rotate(90deg) scaleX(0.8)',
      },
      '50%': {
        transform: 'rotate(180deg) scaleX(1)',
      },
      '75%': {
        transform: 'rotate(270deg) scaleX(0.8)',
      },
      '100%': {
        transform: 'rotate(360deg) scaleX(1)',
      },
    },
  },
  'twist-in': {
    '@keyframes jumi-twist-in': {
      '0%': {
        opacity: '0',
        transform: 'rotate(-180deg) scaleX(0)',
      },
      '100%': {
        opacity: '1',
        transform: 'rotate(0deg) scaleX(1)',
      },
    },
  },
  'twist-out': {
    '@keyframes jumi-twist-out': {
      '0%': {
        opacity: '1',
        transform: 'rotate(0deg) scaleX(1)',
      },
      '100%': {
        opacity: '0',
        transform: 'rotate(180deg) scaleX(0)',
      },
    },
  },
  'wobble-3d': {
    '@keyframes jumi-wobble-3d': {
      '0%': {
        transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg)',
      },
      '15%': {
        transform: 'perspective(1000px) rotateX(-25deg) rotateY(25deg)',
      },
      '30%': {
        transform: 'perspective(1000px) rotateX(15deg) rotateY(-15deg)',
      },
      '45%': {
        transform: 'perspective(1000px) rotateX(-15deg) rotateY(15deg)',
      },
      '60%': {
        transform: 'perspective(1000px) rotateX(10deg) rotateY(-5deg)',
      },
      '75%': {
        transform: 'perspective(1000px) rotateX(-5deg) rotateY(5deg)',
      },
      '100%': {
        transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg)',
      },
    },
  },
}

const visualEffect = {
  'blink': {
    '@keyframes jumi-blink': {
      '0%, 100%': {
        opacity: '1',
      },
      '50%': {
        opacity: '0',
      },
    },
  },
  'blur-in': {
    '@keyframes jumi-blur-in': {
      '0%': {
        filter: 'blur(10px)',
        opacity: '0',
      },
      '100%': {
        filter: 'blur(0px)',
        opacity: '1',
      },
    },
  },
  'blur-out': {
    '@keyframes jumi-blur-out': {
      '0%': {
        filter: 'blur(0px)',
        opacity: '1',
      },
      '100%': {
        filter: 'blur(10px)',
        opacity: '0',
      },
    },
  },
  'character-fade': {
    '@keyframes jumi-character-fade': {
      '0%': {
        opacity: '0',
        transform: 'translateY(10px)',
      },
      '100%': {
        opacity: '1',
        transform: 'translateY(0)',
      },
    },
  },
  'distort': {
    '@keyframes jumi-distort': {
      '0%': {
        filter: 'blur(0px)',
        transform: 'scale(1) skew(0deg, 0deg)',
      },
      '25%': {
        filter: 'blur(2px)',
        transform: 'scale(1.1, 0.9) skew(5deg, -5deg)',
      },
      '50%': {
        filter: 'blur(1px)',
        transform: 'scale(0.9, 1.1) skew(-5deg, 5deg)',
      },
      '75%': {
        filter: 'blur(0.5px)',
        transform: 'scale(1.05, 0.95) skew(2deg, -2deg)',
      },
      '100%': {
        filter: 'blur(0px)',
        transform: 'scale(1) skew(0deg, 0deg)',
      },
    },
  },
  'elastic': {
    '@keyframes jumi-elastic': {
      '0%': {
        transform: 'scale(1)',
      },
      '30%': {
        transform: 'scale(1.25, 0.75)',
      },
      '40%': {
        transform: 'scale(0.75, 1.25)',
      },
      '60%': {
        transform: 'scale(1.15, 0.85)',
      },
      '100%': {
        transform: 'scale(1)',
      },
    },
  },
  'flicker': {
    '@keyframes jumi-flicker': {
      '0%, 100%': {
        opacity: '1',
      },
      '10%': {
        opacity: '0.8',
      },
      '20%': {
        opacity: '1',
      },
      '30%': {
        opacity: '0.3',
      },
      '40%': {
        opacity: '1',
      },
      '50%': {
        opacity: '0.5',
      },
      '60%': {
        opacity: '1',
      },
      '70%': {
        opacity: '0.7',
      },
      '80%': {
        opacity: '0.9',
      },
      '90%': {
        opacity: '0.2',
      },
    },
  },
  'glitch': {
    '@keyframes jumi-glitch': {
      '0%, 100%': {
        transform: 'translate(0)',
      },
      '10%': {
        transform: 'translate(-2px, 2px)',
      },
      '20%': {
        transform: 'translate(2px, -2px)',
      },
      '30%': {
        transform: 'translate(-2px, -2px)',
      },
      '40%': {
        transform: 'translate(2px, 2px)',
      },
      '50%': {
        transform: 'translate(-2px, 2px)',
      },
      '60%': {
        transform: 'translate(2px, -2px)',
      },
      '70%': {
        transform: 'translate(-2px, -2px)',
      },
      '80%': {
        transform: 'translate(2px, 2px)',
      },
      '90%': {
        transform: 'translate(-2px, 2px)',
      },
    },
  },
  'glow': {
    '@keyframes jumi-glow': {
      '0%': {
        filter: 'drop-shadow(0 0 5px currentColor)',
      },
      '50%': {
        filter: 'drop-shadow(0 0 20px currentColor)',
      },
      '100%': {
        filter: 'drop-shadow(0 0 5px currentColor)',
      },
    },
  },
  'hue-invert': {
    '@keyframes jumi-hue-invert': {
      '0%': {
        filter: 'hue-rotate(0deg) contrast(100%)',
      },
      '50%': {
        filter: 'hue-rotate(180deg) contrast(150%)',
      },
      '100%': {
        filter: 'hue-rotate(360deg) contrast(100%)',
      },
    },
  },
  'hue-shift': {
    '@keyframes jumi-hue-shift': {
      '0%': {
        filter: 'hue-rotate(0deg)',
      },
      '100%': {
        filter: 'hue-rotate(360deg)',
      },
    },
  },
  'lift': {
    '@keyframes jumi-lift': {
      '0%': {
        transform: 'translateY(0) scale(1)',
      },
      '100%': {
        transform: 'translateY(-5px) scale(1.02)',
      },
    },
  },
  'neon': {
    '@keyframes jumi-neon': {
      '0%, 100%': {
        filter: 'drop-shadow(0 0 5px currentColor) drop-shadow(0 0 10px currentColor)',
      },
      '50%': {
        filter: 'drop-shadow(0 0 10px currentColor) drop-shadow(0 0 20px currentColor) drop-shadow(0 0 30px currentColor)',
      },
    },
  },
  'pulse-glow': {
    '@keyframes jumi-pulse-glow': {
      '0%': {
        filter: 'drop-shadow(0 0 0px currentColor)',
        transform: 'scale(1)',
      },
      '50%': {
        filter: 'drop-shadow(0 0 15px currentColor)',
        transform: 'scale(1.05)',
      },
      '100%': {
        filter: 'drop-shadow(0 0 0px currentColor)',
        transform: 'scale(1)',
      },
    },
  },
  'rainbow': {
    '@keyframes jumi-rainbow': {
      '0%': { filter: 'hue-rotate(0deg) saturate(100%)' },
      '16%': { filter: 'hue-rotate(60deg) saturate(120%)' },
      '32%': { filter: 'hue-rotate(120deg) saturate(120%)' },
      '48%': { filter: 'hue-rotate(180deg) saturate(120%)' },
      '64%': { filter: 'hue-rotate(240deg) saturate(120%)' },
      '80%': { filter: 'hue-rotate(300deg) saturate(120%)' },
      '100%': { filter: 'hue-rotate(360deg) saturate(100%)' },
    },
  },
  'ripple': {
    '@keyframes jumi-ripple': {
      '0%': {
        opacity: '1',
        transform: 'scale(1)',
      },
      '100%': {
        opacity: '0',
        transform: 'scale(4)',
      },
    },
  },
  'shadow': {
    '@keyframes jumi-shadow': {
      '0%': {
        'text-shadow': '0 0 0 transparent',
      },
      '50%': {
        'text-shadow': '2px 2px 8px rgba(0,0,0,0.5)',
      },
      '100%': {
        'text-shadow': '0 0 0 transparent',
      },
    },
  },
  'shimmer': {
    '@keyframes jumi-shimmer': {
      '0%': {
        opacity: '0',
        transform: 'translateX(-100%)',
      },
      '50%': {
        opacity: '1',
      },
      '100%': {
        opacity: '0',
        transform: 'translateX(100%)',
      },
    },
  },
  'spacing': {
    '@keyframes jumi-spacing': {
      '0%': {
        'letter-spacing': '0em',
        'opacity': '0',
      },
      '100%': {
        'letter-spacing': '0.1em',
        'opacity': '1',
      },
    },
  },
  'static': {
    '@keyframes jumi-static': {
      '0%': {
        filter: 'contrast(100%) brightness(100%)',
      },
      '25%': {
        filter: 'contrast(120%) brightness(90%)',
      },
      '50%': {
        filter: 'contrast(80%) brightness(110%)',
      },
      '75%': {
        filter: 'contrast(110%) brightness(85%)',
      },
      '100%': {
        filter: 'contrast(100%) brightness(100%)',
      },
    },
  },
  'surprise': {
    '@keyframes jumi-surprise': {
      '0%': {
        transform: 'scale(1) rotate(0deg)',
      },
      '25%': {
        transform: 'scale(1.2) rotate(-5deg)',
      },
      '50%': {
        transform: 'scale(0.9) rotate(5deg)',
      },
      '75%': {
        transform: 'scale(1.1) rotate(-2deg)',
      },
      '100%': {
        transform: 'scale(1) rotate(0deg)',
      },
    },
  },
  'typewriter': {
    '@keyframes jumi-typewriter': {
      '0%': {
        width: '0',
      },
      '100%': {
        width: '100%',
      },
    },
  },
  'wave': {
    '@keyframes jumi-wave': {
      '0%, 100%': {
        transform: 'rotate(0deg)',
      },
      '10%': {
        transform: 'rotate(14deg)',
      },
      '20%': {
        transform: 'rotate(-8deg)',
      },
      '30%': {
        transform: 'rotate(14deg)',
      },
      '40%': {
        transform: 'rotate(-4deg)',
      },
      '50%': {
        transform: 'rotate(10deg)',
      },
      '60%': {
        transform: 'rotate(0deg)',
      },
    },
  },
  'wiggle': {
    '@keyframes jumi-wiggle': {
      '0%, 100%': {
        transform: 'rotate(0deg)',
      },
      '25%': {
        transform: 'rotate(1deg)',
      },
      '75%': {
        transform: 'rotate(-1deg)',
      },
    },
  },
  'word-slide': {
    '@keyframes jumi-word-slide': {
      '0%': {
        opacity: '0',
        transform: 'translateY(20px)',
      },
      '100%': {
        opacity: '1',
        transform: 'translateY(0)',
      },
    },
  },
}

export const specialEffect = {
  'heart-beat': {
    '@keyframes jumi-heart-beat': {
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
  },
  'jello': {
    '@keyframes jumi-jello': {
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
  },
  'pulsate': {
    '@keyframes jumi-pulsate': {
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
  },
  'shake': {
    '@keyframes jumi-shake': {
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
  },
  'swing': {
    '@keyframes jumi-swing': {
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
  },
  'tada': {
    '@keyframes jumi-tada': {
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
  },
  'wobble': {
    '@keyframes jumi-wobble': {
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
  },
}

export const effectKeyframes = {
  ...backEffect,
  ...bounceEffect,
  ...circleEffect,
  ...diamondEffect,
  ...fadeEffect,
  ...flipEffect,
  ...movementEffect,
  ...powerEffect,
  ...revealEffect,
  ...slideEffect,
  ...squareEffect,
  ...triangleEffect,
  ...transform3dEffect,
  ...visualEffect,
  ...spiralEffect,
  ...frameEffect,
  ...zoomEffect,
  ...specialEffect,
}

type KeyframesCollection = {
  collection: Record<string, string>
  names: string[]
}

const keyframes: KeyframesCollection = Object.keys(effectKeyframes).reduce(
  (result, property) => {
    result.collection[property] = property
    result.names.push(property)
    return result
  },
  { collection: {}, names: [] } as KeyframesCollection,
)

export const effectNames = keyframes.names
export const effectCollection = keyframes.collection
