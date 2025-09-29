export const effectKeyframes = {
  'accordion': {
    '@keyframes jumi-accordion': {
      '0%': {
        'max-height': '0',
        'opacity': '0',
        'transform': 'scaleY(0)',
        'transform-origin': 'top',
      },
      '60%': {
        'max-height': '500px',
        'opacity': '0.8',
        'transform': 'scaleY(1.1)',
      },
      '100%': {
        'max-height': '1000px',
        'opacity': '1',
        'transform': 'scaleY(1)',
      },
    },
  },
  'arc-left': {
    '@keyframes jumi-arc-left': {
      '0%': {
        'opacity': '0',
        'transform': 'translateX(100px) translateY(50px) rotate(45deg)',
        'transform-origin': 'center',
      },
      '50%': {
        opacity: '0.8',
        transform: 'translateX(0) translateY(-20px) rotate(0deg)',
      },
      '100%': {
        opacity: '1',
        transform: 'translateX(0) translateY(0) rotate(0deg)',
      },
    },
  },
  'arc-right': {
    '@keyframes jumi-arc-right': {
      '0%': {
        'opacity': '0',
        'transform': 'translateX(-100px) translateY(50px) rotate(-45deg)',
        'transform-origin': 'center',
      },
      '50%': {
        opacity: '0.8',
        transform: 'translateX(0) translateY(-20px) rotate(0deg)',
      },
      '100%': {
        opacity: '1',
        transform: 'translateX(0) translateY(0) rotate(0deg)',
      },
    },
  },
  'back-in': {
    '@keyframes jumi-back-in': {
      '0%': {
        opacity: '0',
        transform: 'scale(0.3) rotateZ(-180deg)',
      },
      '100%': {
        opacity: '1',
        transform: 'scale(1) rotateZ(0deg)',
      },
    },
  },
  'back-in-down': {
    '@keyframes jumi-back-in-down': {
      '0%': {
        opacity: '0',
        transform: 'scale(0.3) translateY(-100px) rotateZ(-180deg)',
      },
      '100%': {
        opacity: '1',
        transform: 'scale(1) translateY(0) rotateZ(0deg)',
      },
    },
  },
  'back-in-left': {
    '@keyframes jumi-back-in-left': {
      '0%': {
        opacity: '0',
        transform: 'scale(0.3) translateX(-100px) rotateZ(-180deg)',
      },
      '100%': {
        opacity: '1',
        transform: 'scale(1) translateX(0) rotateZ(0deg)',
      },
    },
  },
  'back-in-right': {
    '@keyframes jumi-back-in-right': {
      '0%': {
        opacity: '0',
        transform: 'scale(0.3) translateX(100px) rotateZ(180deg)',
      },
      '100%': {
        opacity: '1',
        transform: 'scale(1) translateX(0) rotateZ(0deg)',
      },
    },
  },
  'back-in-up': {
    '@keyframes jumi-back-in-up': {
      '0%': {
        opacity: '0',
        transform: 'scale(0.3) translateY(100px) rotateZ(180deg)',
      },
      '100%': {
        opacity: '1',
        transform: 'scale(1) translateY(0) rotateZ(0deg)',
      },
    },
  },
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
  'bounce-in': {
    '@keyframes jumi-bounce-in': {
      '0%': {
        opacity: '0',
        transform: 'scale3d(0.3, 0.3, 0.3)',
      },
      '50%': {
        opacity: '1',
        transform: 'scale3d(1.1, 1.1, 1.1)',
      },
      '100%': {
        opacity: '1',
        transform: 'scale3d(1, 1, 1)',
      },
    },
  },
  'bounce-in-down': {
    '@keyframes jumi-bounce-in-down': {
      '0%': {
        opacity: '0',
        transform: 'translate3d(0, -100px, 0)',
      },
      '50%': {
        opacity: '1',
        transform: 'translate3d(0, 10px, 0)',
      },
      '100%': {
        opacity: '1',
        transform: 'translate3d(0, 0, 0)',
      },
    },
  },
  'bounce-in-left': {
    '@keyframes jumi-bounce-in-left': {
      '0%': {
        opacity: '0',
        transform: 'translate3d(-100px, 0, 0)',
      },
      '50%': {
        opacity: '1',
        transform: 'translate3d(10px, 0, 0)',
      },
      '100%': {
        opacity: '1',
        transform: 'translate3d(0, 0, 0)',
      },
    },
  },
  'bounce-in-right': {
    '@keyframes jumi-bounce-in-right': {
      '0%': {
        opacity: '0',
        transform: 'translate3d(100px, 0, 0)',
      },
      '50%': {
        opacity: '1',
        transform: 'translate3d(-10px, 0, 0)',
      },
      '100%': {
        opacity: '1',
        transform: 'translate3d(0, 0, 0)',
      },
    },
  },
  'bounce-in-up': {
    '@keyframes jumi-bounce-in-up': {
      '0%': {
        opacity: '0',
        transform: 'translate3d(0, 100px, 0)',
      },
      '50%': {
        opacity: '1',
        transform: 'translate3d(0, -10px, 0)',
      },
      '100%': {
        opacity: '1',
        transform: 'translate3d(0, 0, 0)',
      },
    },
  },
  'bounce-out': {
    '@keyframes jumi-bounce-out': {
      '0%': {
        opacity: '1',
        transform: 'scale3d(1, 1, 1)',
      },
      '50%': {
        opacity: '1',
        transform: 'scale3d(1.1, 1.1, 1.1)',
      },
      '100%': {
        opacity: '0',
        transform: 'scale3d(0.3, 0.3, 0.3)',
      },
    },
  },
  'bounce-out-down': {
    '@keyframes jumi-bounce-out-down': {
      '0%': {
        opacity: '1',
        transform: 'translate3d(0, 0, 0)',
      },
      '50%': {
        opacity: '1',
        transform: 'translate3d(0, -10px, 0)',
      },
      '100%': {
        opacity: '0',
        transform: 'translate3d(0, 100px, 0)',
      },
    },
  },
  'bounce-out-left': {
    '@keyframes jumi-bounce-out-left': {
      '0%': {
        opacity: '1',
        transform: 'translate3d(0, 0, 0)',
      },
      '50%': {
        opacity: '1',
        transform: 'translate3d(10px, 0, 0)',
      },
      '100%': {
        opacity: '0',
        transform: 'translate3d(-100px, 0, 0)',
      },
    },
  },
  'bounce-out-right': {
    '@keyframes jumi-bounce-out-right': {
      '0%': {
        opacity: '1',
        transform: 'translate3d(0, 0, 0)',
      },
      '50%': {
        opacity: '1',
        transform: 'translate3d(-10px, 0, 0)',
      },
      '100%': {
        opacity: '0',
        transform: 'translate3d(100px, 0, 0)',
      },
    },
  },
  'bounce-out-up': {
    '@keyframes jumi-bounce-out-up': {
      '0%': {
        opacity: '1',
        transform: 'translate3d(0, 0, 0)',
      },
      '50%': {
        opacity: '1',
        transform: 'translate3d(0, 10px, 0)',
      },
      '100%': {
        opacity: '0',
        transform: 'translate3d(0, -100px, 0)',
      },
    },
  },
  'bubble': {
    '@keyframes jumi-bubble': {
      '0%': {
        'border-radius': '50%',
        'opacity': '0',
        'transform': 'scale(0) translateY(50px)',
      },
      '50%': {
        'border-radius': '60% 40% 50% 50%',
        'opacity': '0.7',
        'transform': 'scale(0.8) translateY(-10px)',
      },
      '100%': {
        'border-radius': '50%',
        'opacity': '1',
        'transform': 'scale(1) translateY(0)',
      },
    },
  },
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
  'drip': {
    '@keyframes jumi-drip': {
      '0%': {
        'border-radius': '50% 50% 50% 50%',
        'opacity': '0',
        'transform': 'translateY(-20px) scaleY(0.2)',
      },
      '40%': {
        'border-radius': '50% 50% 50% 50%',
        'opacity': '0.8',
        'transform': 'translateY(0) scaleY(1.2)',
      },
      '60%': {
        'border-radius': '50% 50% 40% 60%',
        'transform': 'translateY(5px) scaleY(0.8)',
      },
      '80%': {
        'border-radius': '50% 50% 30% 70%',
        'transform': 'translateY(20px) scaleY(1.5)',
      },
      '100%': {
        'border-radius': '50% 50% 50% 50%',
        'opacity': '1',
        'transform': 'translateY(0) scaleY(1)',
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
  'expand-down': {
    '@keyframes jumi-expand-down': {
      '0%': {
        height: '0%',
        opacity: '1',
      },
      '100%': {
        height: '100%',
        opacity: '1',
      },
    },
  },
  'expand-left': {
    '@keyframes jumi-expand-left': {
      '0%': {
        opacity: '1',
        width: '0%',
      },
      '100%': {
        opacity: '1',
        width: '100%',
      },
    },
  },
  'expand-right': {
    '@keyframes jumi-expand-right': {
      '0%': {
        'opacity': '1',
        'transform-origin': 'right',
        'width': '0%',
      },
      '100%': {
        'opacity': '1',
        'transform-origin': 'right',
        'width': '100%',
      },
    },
  },
  'expand-up': {
    '@keyframes jumi-expand-up': {
      '0%': {
        'height': '0%',
        'opacity': '1',
        'transform-origin': 'bottom',
      },
      '100%': {
        'height': '100%',
        'opacity': '1',
        'transform-origin': 'bottom',
      },
    },
  },
  'explode': {
    '@keyframes jumi-explode': {
      '0%': {
        'box-shadow': '0 0 0 0 currentColor',
        'opacity': '1',
        'transform': 'scale(1) rotate(0deg)',
      },
      '50%': {
        'box-shadow': '0 0 20px 10px transparent',
        'opacity': '0.8',
        'transform': 'scale(1.5) rotate(180deg)',
      },
      '100%': {
        'box-shadow': '0 0 50px 25px transparent',
        'opacity': '0',
        'transform': 'scale(2) rotate(360deg)',
      },
    },
  },
  'fade-in': {
    '@keyframes jumi-fade-in': {
      '0%': {
        opacity: '0',
      },
      '100%': {
        opacity: '1',
      },
    },
  },
  'fade-in-blur': {
    '@keyframes jumi-fade-in-blur': {
      '0%': {
        filter: 'blur(8px)',
        opacity: '0',
      },
      '100%': {
        filter: 'blur(0px)',
        opacity: '1',
      },
    },
  },
  'fade-in-down': {
    '@keyframes jumi-fade-in-down': {
      '0%': {
        opacity: '0',
        transform: 'translate3d(0, -60px, 0)',
      },
      '100%': {
        opacity: '1',
        transform: 'translate3d(0, 0, 0)',
      },
    },
  },
  'fade-in-left': {
    '@keyframes jumi-fade-in-left': {
      '0%': {
        opacity: '0',
        transform: 'translate3d(-60px, 0, 0)',
      },
      '100%': {
        opacity: '1',
        transform: 'translate3d(0, 0, 0)',
      },
    },
  },
  'fade-in-right': {
    '@keyframes jumi-fade-in-right': {
      '0%': {
        opacity: '0',
        transform: 'translate3d(60px, 0, 0)',
      },
      '100%': {
        opacity: '1',
        transform: 'translate3d(0, 0, 0)',
      },
    },
  },
  'fade-in-up': {
    '@keyframes jumi-fade-in-up': {
      '0%': {
        opacity: '0',
        transform: 'translate3d(0, 60px, 0)',
      },
      '100%': {
        opacity: '1',
        transform: 'translate3d(0, 0, 0)',
      },
    },
  },
  'fade-out': {
    '@keyframes jumi-fade-out': {
      '0%': {
        opacity: '1',
      },
      '100%': {
        opacity: '0',
      },
    },
  },
  'fade-out-blur': {
    '@keyframes jumi-fade-out-blur': {
      '0%': {
        filter: 'blur(0px)',
        opacity: '1',
      },
      '100%': {
        filter: 'blur(8px)',
        opacity: '0',
      },
    },
  },
  'fade-out-down': {
    '@keyframes jumi-fade-out-down': {
      '0%': {
        opacity: '1',
        transform: 'translate3d(0, 0, 0)',
      },
      '100%': {
        opacity: '0',
        transform: 'translate3d(0, 60px, 0)',
      },
    },
  },
  'fade-out-left': {
    '@keyframes jumi-fade-out-left': {
      '0%': {
        opacity: '1',
        transform: 'translate3d(0, 0, 0)',
      },
      '100%': {
        opacity: '0',
        transform: 'translate3d(-60px, 0, 0)',
      },
    },
  },
  'fade-out-right': {
    '@keyframes jumi-fade-out-right': {
      '0%': {
        opacity: '1',
        transform: 'translate3d(0, 0, 0)',
      },
      '100%': {
        opacity: '0',
        transform: 'translate3d(60px, 0, 0)',
      },
    },
  },
  'fade-out-up': {
    '@keyframes jumi-fade-out-up': {
      '0%': {
        opacity: '1',
        transform: 'translate3d(0, 0, 0)',
      },
      '100%': {
        opacity: '0',
        transform: 'translate3d(0, -60px, 0)',
      },
    },
  },
  'fall-down': {
    '@keyframes jumi-fall-down': {
      '0%': {
        opacity: '1',
        transform: 'translateY(-300px) scaleY(1)',
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
        transform: 'translateX(-300px) scaleX(1)',
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
        transform: 'translateX(300px) scaleX(1)',
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
        transform: 'translateY(300px) scaleY(1)',
      },
      '75%': {
        transform: 'translateY(-25px) scaleY(0.9)',
      },
      '100%': {
        transform: 'translateY(0) scaleY(1)',
      },
    },
  },
  'figure-eight': {
    '@keyframes jumi-figure-eight': {
      '0%': {
        transform: 'translateX(0) translateY(0) rotate(0deg)',
      },
      '12.5%': {
        transform: 'translateX(15px) translateY(-10px) rotate(45deg)',
      },
      '25%': {
        transform: 'translateX(20px) translateY(0) rotate(90deg)',
      },
      '37.5%': {
        transform: 'translateX(15px) translateY(10px) rotate(135deg)',
      },
      '50%': {
        transform: 'translateX(0) translateY(0) rotate(180deg)',
      },
      '62.5%': {
        transform: 'translateX(-15px) translateY(-10px) rotate(225deg)',
      },
      '75%': {
        transform: 'translateX(-20px) translateY(0) rotate(270deg)',
      },
      '87.5%': {
        transform: 'translateX(-15px) translateY(10px) rotate(315deg)',
      },
      '100%': {
        transform: 'translateX(0) translateY(0) rotate(360deg)',
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
  'flip-card-x': {
    '@keyframes jumi-flip-card-x': {
      '0%': {
        backfaceVisibility: 'hidden',
        transform: 'rotateX(0deg)',
      },
      '50%': {
        backfaceVisibility: 'hidden',
        transform: 'rotateX(90deg)',
      },
      '100%': {
        backfaceVisibility: 'hidden',
        transform: 'rotateX(180deg)',
      },
    },
  },
  'flip-card-y': {
    '@keyframes jumi-flip-card-y': {
      '0%': {
        backfaceVisibility: 'hidden',
        transform: 'rotateY(0deg)',
      },
      '50%': {
        backfaceVisibility: 'hidden',
        transform: 'rotateY(90deg)',
      },
      '100%': {
        backfaceVisibility: 'hidden',
        transform: 'rotateY(180deg)',
      },
    },
  },
  'flip-diagonal': {
    '@keyframes jumi-flip-diagonal': {
      '0%': {
        transform: 'rotateX(0deg) rotateY(0deg)',
      },
      '50%': {
        transform: 'rotateX(90deg) rotateY(90deg)',
      },
      '100%': {
        transform: 'rotateX(180deg) rotateY(180deg)',
      },
    },
  },
  'flip-in-bottom': {
    '@keyframes jumi-flip-in-bottom': {
      '40%': {
        'opacity': '1',
        'transform': 'rotateX(15deg)',
        'transform-origin': 'center top',
      },
      '70%': {
        'transform': 'rotateX(-8deg)',
        'transform-origin': 'center top',
      },
      'from': {
        'opacity': '0',
        'transform': 'rotateX(-90deg)',
        'transform-origin': 'center top',
      },
      'to': {
        'opacity': '1',
        'transform': 'rotateX(0deg)',
        'transform-origin': 'center top',
      },
    },
  },
  'flip-in-left': {
    '@keyframes jumi-flip-in-left': {
      '40%': {
        'opacity': '1',
        'transform': 'rotateY(-15deg)',
        'transform-origin': 'right center',
      },
      '70%': {
        'transform': 'rotateY(8deg)',
        'transform-origin': 'right center',
      },
      'from': {
        'opacity': '0',
        'transform': 'rotateY(90deg)',
        'transform-origin': 'right center',
      },
      'to': {
        'opacity': '1',
        'transform': 'rotateY(0deg)',
        'transform-origin': 'right center',
      },
    },
  },
  'flip-in-right': {
    '@keyframes jumi-flip-in-right': {
      '40%': {
        'opacity': '1',
        'transform': 'rotateY(15deg)',
        'transform-origin': 'left center',
      },
      '70%': {
        'transform': 'rotateY(-8deg)',
        'transform-origin': 'left center',
      },
      'from': {
        'opacity': '0',
        'transform': 'rotateY(-90deg)',
        'transform-origin': 'left center',
      },
      'to': {
        'opacity': '1',
        'transform': 'rotateY(0deg)',
        'transform-origin': 'left center',
      },
    },
  },
  'flip-in-top': {
    '@keyframes jumi-flip-in-top': {
      '40%': {
        'opacity': '1',
        'transform': 'rotateX(-15deg)',
        'transform-origin': 'center bottom',
      },
      '70%': {
        'transform': 'rotateX(8deg)',
        'transform-origin': 'center bottom',
      },
      'from': {
        'opacity': '0',
        'transform': 'rotateX(90deg)',
        'transform-origin': 'center bottom',
      },
      'to': {
        'opacity': '1',
        'transform': 'rotateX(0deg)',
        'transform-origin': 'center bottom',
      },
    },
  },
  'flip-in-x': {
    '@keyframes jumi-flip-in-x': {
      '40%': {
        opacity: '1',
        transform: 'rotateX(20deg)',
      },
      '70%': {
        transform: 'rotateX(-10deg)',
      },
      '90%': {
        transform: 'rotateX(5deg)',
      },
      'from': {
        opacity: '0',
        transform: 'rotateX(-90deg)',
      },
      'to': {
        opacity: '1',
        transform: 'rotateX(0deg)',
      },
    },
  },
  'flip-in-y': {
    '@keyframes jumi-flip-in-y': {
      '40%': {
        opacity: '1',
        transform: 'rotateY(20deg)',
      },
      '70%': {
        transform: 'rotateY(-10deg)',
      },
      '90%': {
        transform: 'rotateY(5deg)',
      },
      'from': {
        opacity: '0',
        transform: 'rotateY(-90deg)',
      },
      'to': {
        opacity: '1',
        transform: 'rotateY(0deg)',
      },
    },
  },
  'flip-wobble-x': {
    '@keyframes jumi-flip-wobble-x': {
      '0%': {
        transform: 'rotateX(0deg)',
      },
      '15%': {
        transform: 'rotateX(-25deg)',
      },
      '30%': {
        transform: 'rotateX(15deg)',
      },
      '45%': {
        transform: 'rotateX(-10deg)',
      },
      '60%': {
        transform: 'rotateX(5deg)',
      },
      '75%': {
        transform: 'rotateX(-2deg)',
      },
      '100%': {
        transform: 'rotateX(0deg)',
      },
    },
  },
  'flip-wobble-y': {
    '@keyframes jumi-flip-wobble-y': {
      '0%': {
        transform: 'rotateY(0deg)',
      },
      '15%': {
        transform: 'rotateY(-25deg)',
      },
      '30%': {
        transform: 'rotateY(15deg)',
      },
      '45%': {
        transform: 'rotateY(-10deg)',
      },
      '60%': {
        transform: 'rotateY(5deg)',
      },
      '75%': {
        transform: 'rotateY(-2deg)',
      },
      '100%': {
        transform: 'rotateY(0deg)',
      },
    },
  },
  'flip-x': {
    '@keyframes jumi-flip-x': {
      '0%': {
        transform: 'rotateX(0deg)',
      },
      '100%': {
        transform: 'rotateX(360deg)',
      },
    },
  },
  'flip-x-elastic': {
    '@keyframes jumi-flip-x-elastic': {
      '0%': {
        transform: 'rotateX(0deg)',
      },
      '20%': {
        transform: 'rotateX(200deg)',
      },
      '40%': {
        transform: 'rotateX(160deg)',
      },
      '60%': {
        transform: 'rotateX(190deg)',
      },
      '80%': {
        transform: 'rotateX(175deg)',
      },
      '100%': {
        transform: 'rotateX(180deg)',
      },
    },
  },
  'flip-y': {
    '@keyframes jumi-flip-y': {
      '0%': {
        transform: 'rotateY(0deg)',
      },
      '100%': {
        transform: 'rotateY(360deg)',
      },
    },
  },
  'flip-y-elastic': {
    '@keyframes jumi-flip-y-elastic': {
      '0%': {
        transform: 'rotateY(0deg)',
      },
      '20%': {
        transform: 'rotateY(200deg)',
      },
      '40%': {
        transform: 'rotateY(160deg)',
      },
      '60%': {
        transform: 'rotateY(190deg)',
      },
      '80%': {
        transform: 'rotateY(175deg)',
      },
      '100%': {
        transform: 'rotateY(180deg)',
      },
    },
  },
  'flip-zoom-x': {
    '@keyframes jumi-flip-zoom-x': {
      '0%': {
        opacity: '1',
        transform: 'scale(1) rotateX(0deg)',
      },
      '50%': {
        opacity: '0.7',
        transform: 'scale(0.8) rotateX(90deg)',
      },
      '100%': {
        opacity: '1',
        transform: 'scale(1) rotateX(180deg)',
      },
    },
  },
  'flip-zoom-y': {
    '@keyframes jumi-flip-zoom-y': {
      '0%': {
        opacity: '1',
        transform: 'scale(1) rotateY(0deg)',
      },
      '50%': {
        opacity: '0.7',
        transform: 'scale(0.8) rotateY(90deg)',
      },
      '100%': {
        opacity: '1',
        transform: 'scale(1) rotateY(180deg)',
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
  'fold-in': {
    '@keyframes jumi-fold-in': {
      '0%': {
        'opacity': '0',
        'transform': 'scaleY(0) rotateX(-90deg)',
        'transform-origin': 'bottom',
      },
      '50%': {
        opacity: '0.7',
        transform: 'scaleY(0.5) rotateX(-45deg)',
      },
      '100%': {
        opacity: '1',
        transform: 'scaleY(1) rotateX(0deg)',
      },
    },
  },
  'fold-out': {
    '@keyframes jumi-fold-out': {
      '0%': {
        'opacity': '1',
        'transform': 'scaleY(1) rotateX(0deg)',
        'transform-origin': 'bottom',
      },
      '50%': {
        opacity: '0.7',
        transform: 'scaleY(0.5) rotateX(-45deg)',
      },
      '100%': {
        opacity: '0',
        transform: 'scaleY(0) rotateX(-90deg)',
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
  'heart-beat': {
    '@keyframes jumi-heart-beat': {
      '0%': {
        transform: 'scale3d(1, 1, 1)',
      },
      '10%': {
        transform: 'scale3d(1.3, 1.3, 1.3)',
      },
      '20%': {
        transform: 'scale3d(1, 1, 1)',
      },
      '25%': {
        transform: 'scale3d(1.15, 1.15, 1.15)',
      },
      '35%': {
        transform: 'scale3d(1, 1, 1)',
      },
      '100%': {
        transform: 'scale3d(1, 1, 1)',
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
  'implode': {
    '@keyframes jumi-implode': {
      '0%': {
        'box-shadow': '0 0 50px 25px currentColor',
        'opacity': '1',
        'transform': 'scale(2) rotate(360deg)',
      },
      '50%': {
        'box-shadow': '0 0 20px 10px currentColor',
        'opacity': '0.8',
        'transform': 'scale(1.5) rotate(180deg)',
      },
      '100%': {
        'box-shadow': '0 0 0 0 currentColor',
        'opacity': '1',
        'transform': 'scale(1) rotate(0deg)',
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
  'letter-space-in': {
    '@keyframes jumi-letter-space-in': {
      '0%': {
        'letter-spacing': '-0.5em',
        'opacity': '0',
      },
      '100%': {
        'letter-spacing': '0em',
        'opacity': '1',
      },
    },
  },
  'letter-space-out': {
    '@keyframes jumi-letter-space-out': {
      '0%': {
        'letter-spacing': '0em',
        'opacity': '1',
      },
      '100%': {
        'letter-spacing': '0.5em',
        'opacity': '0',
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
  'magnetic': {
    '@keyframes jumi-magnetic': {
      '0%': {
        transform: 'translateX(0) scale(1)',
      },
      '30%': {
        transform: 'translateX(-15px) scale(1.1)',
      },
      '60%': {
        transform: 'translateX(10px) scale(0.9)',
      },
      '100%': {
        transform: 'translateX(0) scale(1)',
      },
    },
  },
  'mask': {
    '@keyframes jumi-mask': {
      '0%': {
        'clip-path': 'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
      },
      '100%': {
        'clip-path': 'polygon(0 40%, 100% 40%, 100% 60%, 0 60%)',
      },
    },
  },
  'mask-bottom': {
    '@keyframes jumi-mask-bottom': {
      '0%': {
        'clip-path': 'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
      },
      '100%': {
        'clip-path': 'polygon(0 100%, 100% 100%, 100% 100%, 0 100%)',
      },
    },
  },
  'mask-bottom-left': {
    '@keyframes jumi-mask-bottom-left': {
      '0%': {
        'clip-path': 'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
      },
      '100%': {
        'clip-path': 'polygon(0 100%, 0 100%, 0 100%, 0 100%)',
      },
    },
  },
  'mask-bottom-right': {
    '@keyframes jumi-mask-bottom-right': {
      '0%': {
        'clip-path': 'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
      },
      '100%': {
        'clip-path': 'polygon(100% 100%, 100% 100%, 100% 100%, 100% 100%)',
      },
    },
  },
  'mask-left': {
    '@keyframes jumi-mask-left': {
      '0%': {
        'clip-path': 'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
      },
      '100%': {
        'clip-path': 'polygon(0 0, 0 0, 0 100%, 0 100%)',
      },
    },
  },
  'mask-right': {
    '@keyframes jumi-mask-right': {
      '0%': {
        'clip-path': 'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
      },
      '100%': {
        'clip-path': 'polygon(100% 0, 100% 0, 100% 100%, 100% 100%)',
      },
    },
  },
  'mask-top': {
    '@keyframes jumi-mask-top': {
      '0%': {
        'clip-path': 'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
      },
      '100%': {
        'clip-path': 'polygon(0 0, 100% 0, 100% 0, 0 0)',
      },
    },
  },
  'mask-top-left': {
    '@keyframes jumi-mask-top-left': {
      '0%': {
        'clip-path': 'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
      },
      '100%': {
        'clip-path': 'polygon(0 0, 0 0, 0 0, 0 0)',
      },
    },
  },
  'mask-top-right': {
    '@keyframes jumi-mask-top-right': {
      '0%': {
        'clip-path': 'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
      },
      '100%': {
        'clip-path': 'polygon(100% 0, 100% 0, 100% 0, 100% 0)',
      },
    },
  },
  'melt': {
    '@keyframes jumi-melt': {
      '0%': {
        'border-radius': '10px',
        'opacity': '1',
        'transform': 'scaleY(1)',
      },
      '50%': {
        'border-radius': '10px 10px 50% 50%',
        'opacity': '0.8',
        'transform': 'scaleY(0.6) translateY(20%)',
      },
      '100%': {
        'border-radius': '10px 10px 80% 80%',
        'opacity': '0',
        'transform': 'scaleY(0.2) translateY(50%)',
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
  'pulsing': {
    '@keyframes jumi-pulsing': {
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
  'reveal-down': {
    '@keyframes jumi-reveal-down': {
      '0%': {
        clipPath: 'polygon(0 0, 100% 0, 100% 0, 0 0)',
        opacity: '0',
      },
      '100%': {
        clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
        opacity: '1',
      },
    },
  },
  'reveal-left': {
    '@keyframes jumi-reveal-left': {
      '0%': {
        clipPath: 'polygon(100% 0, 100% 0, 100% 100%, 100% 100%)',
        opacity: '0',
      },
      '100%': {
        clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
        opacity: '1',
      },
    },
  },
  'reveal-right': {
    '@keyframes jumi-reveal-right': {
      '0%': {
        clipPath: 'polygon(0 0, 0 0, 0 100%, 0 100%)',
        opacity: '0',
      },
      '100%': {
        clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
        opacity: '1',
      },
    },
  },
  'reveal-swipe': {
    '@keyframes jumi-reveal-swipe': {
      '0%': {
        'clip-path': 'polygon(0 0, 0 0, 0 100%, 0 100%)',
        'opacity': '0',
        'transform': 'translateX(-20px)',
      },
      '60%': {
        'clip-path': 'polygon(0 0, 80% 0, 80% 100%, 0 100%)',
        'opacity': '1',
        'transform': 'translateX(10px)',
      },
      '100%': {
        'clip-path': 'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
        'opacity': '1',
        'transform': 'translateX(0)',
      },
    },
  },
  'reveal-up': {
    '@keyframes jumi-reveal-up': {
      '0%': {
        clipPath: 'polygon(0 100%, 100% 100%, 100% 100%, 0 100%)',
        opacity: '0',
      },
      '100%': {
        clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
        opacity: '1',
      },
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
  'rush-in-down': {
    '@keyframes jumi-rush-in-down': {
      '0%': {
        opacity: '0',
        transform: 'translateY(-200px) skewY(30deg) scale(0.8)',
      },
      '60%': {
        opacity: '1',
        transform: 'translateY(20px) skewY(-5deg) scale(1.05)',
      },
      '80%': {
        transform: 'translateY(-5px) skewY(2deg) scale(0.98)',
      },
      '100%': {
        opacity: '1',
        transform: 'translateY(0) skewY(0deg) scale(1)',
      },
    },
  },
  'rush-in-left': {
    '@keyframes jumi-rush-in-left': {
      '0%': {
        opacity: '0',
        transform: 'translateX(-200px) skewX(30deg) scale(0.8)',
      },
      '60%': {
        opacity: '1',
        transform: 'translateX(20px) skewX(-5deg) scale(1.05)',
      },
      '80%': {
        transform: 'translateX(-5px) skewX(2deg) scale(0.98)',
      },
      '100%': {
        opacity: '1',
        transform: 'translateX(0) skewX(0deg) scale(1)',
      },
    },
  },
  'rush-in-right': {
    '@keyframes jumi-rush-in-right': {
      '0%': {
        opacity: '0',
        transform: 'translateX(200px) skewX(-30deg) scale(0.8)',
      },
      '60%': {
        opacity: '1',
        transform: 'translateX(-20px) skewX(5deg) scale(1.05)',
      },
      '80%': {
        transform: 'translateX(5px) skewX(-2deg) scale(0.98)',
      },
      '100%': {
        opacity: '1',
        transform: 'translateX(0) skewX(0deg) scale(1)',
      },
    },
  },
  'rush-in-up': {
    '@keyframes jumi-rush-in-up': {
      '0%': {
        opacity: '0',
        transform: 'translateY(200px) skewY(-30deg) scale(0.8)',
      },
      '60%': {
        opacity: '1',
        transform: 'translateY(-20px) skewY(5deg) scale(1.05)',
      },
      '80%': {
        transform: 'translateY(5px) skewY(-2deg) scale(0.98)',
      },
      '100%': {
        opacity: '1',
        transform: 'translateY(0) skewY(0deg) scale(1)',
      },
    },
  },
  'rush-out-down': {
    '@keyframes jumi-rush-out-down': {
      '0%': {
        opacity: '1',
        transform: 'translateY(0) skewY(0deg) scale(1)',
      },
      '20%': {
        transform: 'translateY(-5px) skewY(2deg) scale(0.98)',
      },
      '40%': {
        opacity: '1',
        transform: 'translateY(20px) skewY(-5deg) scale(1.05)',
      },
      '100%': {
        opacity: '0',
        transform: 'translateY(200px) skewY(-30deg) scale(0.8)',
      },
    },
  },
  'rush-out-left': {
    '@keyframes jumi-rush-out-left': {
      '0%': {
        opacity: '1',
        transform: 'translateX(0) skewX(0deg) scale(1)',
      },
      '20%': {
        transform: 'translateX(5px) skewX(-2deg) scale(0.98)',
      },
      '40%': {
        opacity: '1',
        transform: 'translateX(-20px) skewX(5deg) scale(1.05)',
      },
      '100%': {
        opacity: '0',
        transform: 'translateX(-200px) skewX(30deg) scale(0.8)',
      },
    },
  },
  'rush-out-right': {
    '@keyframes jumi-rush-out-right': {
      '0%': {
        opacity: '1',
        transform: 'translateX(0) skewX(0deg) scale(1)',
      },
      '20%': {
        transform: 'translateX(-5px) skewX(2deg) scale(0.98)',
      },
      '40%': {
        opacity: '1',
        transform: 'translateX(20px) skewX(-5deg) scale(1.05)',
      },
      '100%': {
        opacity: '0',
        transform: 'translateX(200px) skewX(-30deg) scale(0.8)',
      },
    },
  },
  'rush-out-up': {
    '@keyframes jumi-rush-out-up': {
      '0%': {
        opacity: '1',
        transform: 'translateY(0) skewY(0deg) scale(1)',
      },
      '20%': {
        transform: 'translateY(5px) skewY(-2deg) scale(0.98)',
      },
      '40%': {
        opacity: '1',
        transform: 'translateY(-20px) skewY(5deg) scale(1.05)',
      },
      '100%': {
        opacity: '0',
        transform: 'translateY(-200px) skewY(30deg) scale(0.8)',
      },
    },
  },
  'scatter': {
    '@keyframes jumi-scatter': {
      '0%': {
        opacity: '1',
        transform: 'scale(1) translateX(0) translateY(0)',
      },
      '25%': {
        opacity: '0.8',
        transform: 'scale(0.8) translateX(-30px) translateY(-15px) rotate(45deg)',
      },
      '50%': {
        opacity: '0.6',
        transform: 'scale(0.6) translateX(40px) translateY(-25px) rotate(-30deg)',
      },
      '75%': {
        opacity: '0.8',
        transform: 'scale(0.8) translateX(-20px) translateY(20px) rotate(15deg)',
      },
      '100%': {
        opacity: '1',
        transform: 'scale(1) translateX(0) translateY(0) rotate(0deg)',
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
  'slide-in-down': {
    '@keyframes jumi-slide-in-down': {
      '0%': {
        opacity: '0',
        transform: 'translate3d(0, -100%, 0)',
        visibility: 'visible',
      },
      '100%': {
        opacity: '1',
        transform: 'translate3d(0, 0, 0)',
      },
    },
  },
  'slide-in-down-elastic': {
    '@keyframes jumi-slide-in-down-elastic': {
      '0%': {
        opacity: '0',
        transform: 'translate3d(0, -100%, 0)',
        visibility: 'visible',
      },
      '60%': {
        opacity: '1',
        transform: 'translate3d(0, 15%, 0)',
      },
      '75%': {
        transform: 'translate3d(0, -5%, 0)',
      },
      '90%': {
        transform: 'translate3d(0, 3%, 0)',
      },
      '100%': {
        opacity: '1',
        transform: 'translate3d(0, 0, 0)',
      },
    },
  },
  'slide-in-left': {
    '@keyframes jumi-slide-in-left': {
      '0%': {
        opacity: '0',
        transform: 'translate3d(-100%, 0, 0)',
        visibility: 'visible',
      },
      '100%': {
        opacity: '1',
        transform: 'translate3d(0, 0, 0)',
      },
    },
  },
  'slide-in-right': {
    '@keyframes jumi-slide-in-right': {
      '0%': {
        opacity: '0',
        transform: 'translate3d(100%, 0, 0)',
        visibility: 'visible',
      },
      '100%': {
        opacity: '1',
        transform: 'translate3d(0, 0, 0)',
      },
    },
  },
  'slide-in-stagger': {
    '@keyframes jumi-slide-in-stagger': {
      '0%': {
        opacity: '0',
        transform: 'translate3d(0, 100%, 0)',
        visibility: 'visible',
      },
      '40%': {
        opacity: '0.7',
        transform: 'translate3d(0, 60%, 0)',
      },
      '70%': {
        opacity: '0.9',
        transform: 'translate3d(0, 20%, 0)',
      },
      '100%': {
        opacity: '1',
        transform: 'translate3d(0, 0, 0)',
      },
    },
  },
  'slide-in-up': {
    '@keyframes jumi-slide-in-up': {
      '0%': {
        opacity: '0',
        transform: 'translate3d(0, 100%, 0)',
        visibility: 'visible',
      },
      '100%': {
        opacity: '1',
        transform: 'translate3d(0, 0, 0)',
      },
    },
  },
  'slide-in-up-elastic': {
    '@keyframes jumi-slide-in-up-elastic': {
      '0%': {
        opacity: '0',
        transform: 'translate3d(0, 100%, 0)',
        visibility: 'visible',
      },
      '60%': {
        opacity: '1',
        transform: 'translate3d(0, -15%, 0)',
      },
      '75%': {
        transform: 'translate3d(0, 5%, 0)',
      },
      '90%': {
        transform: 'translate3d(0, -3%, 0)',
      },
      '100%': {
        opacity: '1',
        transform: 'translate3d(0, 0, 0)',
      },
    },
  },
  'slide-in-up-left': {
    '@keyframes jumi-slide-in-up-left': {
      '0%': {
        opacity: '0',
        transform: 'translate3d(-100%, 100%, 0)',
        visibility: 'visible',
      },
      '100%': {
        opacity: '1',
        transform: 'translate3d(0, 0, 0)',
      },
    },
  },
  'slide-in-up-right': {
    '@keyframes jumi-slide-in-up-right': {
      '0%': {
        opacity: '0',
        transform: 'translate3d(100%, 100%, 0)',
        visibility: 'visible',
      },
      '100%': {
        opacity: '1',
        transform: 'translate3d(0, 0, 0)',
      },
    },
  },
  'slide-out-down': {
    '@keyframes jumi-slide-out-down': {
      '0%': {
        opacity: '1',
        transform: 'translate3d(0, 0, 0)',
      },
      '100%': {
        opacity: '0',
        transform: 'translate3d(0, 100%, 0)',
        visibility: 'hidden',
      },
    },
  },
  'slide-out-left': {
    '@keyframes jumi-slide-out-left': {
      '0%': {
        opacity: '1',
        transform: 'translate3d(0, 0, 0)',
      },
      '100%': {
        opacity: '0',
        transform: 'translate3d(-100%, 0, 0)',
        visibility: 'hidden',
      },
    },
  },
  'slide-out-right': {
    '@keyframes jumi-slide-out-right': {
      '0%': {
        opacity: '1',
        transform: 'translate3d(0, 0, 0)',
      },
      '100%': {
        opacity: '0',
        transform: 'translate3d(100%, 0, 0)',
        visibility: 'hidden',
      },
    },
  },
  'slide-out-up': {
    '@keyframes jumi-slide-out-up': {
      '0%': {
        opacity: '1',
        transform: 'translate3d(0, 0, 0)',
      },
      '100%': {
        opacity: '0',
        transform: 'translate3d(0, -100%, 0)',
        visibility: 'hidden',
      },
    },
  },
  'slide-peek-down': {
    '@keyframes jumi-slide-peek-down': {
      '0%': {
        opacity: '0',
        transform: 'translate3d(0, -50%, 0)',
        visibility: 'visible',
      },
      '100%': {
        opacity: '1',
        transform: 'translate3d(0, 0, 0)',
      },
    },
  },
  'slide-peek-left': {
    '@keyframes jumi-slide-peek-left': {
      '0%': {
        opacity: '0',
        transform: 'translate3d(-50%, 0, 0)',
        visibility: 'visible',
      },
      '100%': {
        opacity: '1',
        transform: 'translate3d(0, 0, 0)',
      },
    },
  },
  'slide-peek-right': {
    '@keyframes jumi-slide-peek-right': {
      '0%': {
        opacity: '0',
        transform: 'translate3d(50%, 0, 0)',
        visibility: 'visible',
      },
      '100%': {
        opacity: '1',
        transform: 'translate3d(0, 0, 0)',
      },
    },
  },
  'slide-peek-up': {
    '@keyframes jumi-slide-peek-up': {
      '0%': {
        opacity: '0',
        transform: 'translate3d(0, 50%, 0)',
        visibility: 'visible',
      },
      '100%': {
        opacity: '1',
        transform: 'translate3d(0, 0, 0)',
      },
    },
  },
  'slide-stack': {
    '@keyframes jumi-slide-stack': {
      '0%': {
        'opacity': '0',
        'transform': 'translateX(-100%) translateY(-20px) scale(0.9)',
        'z-index': '1',
      },
      '50%': {
        'opacity': '0.7',
        'transform': 'translateX(-20%) translateY(-10px) scale(0.95)',
        'z-index': '2',
      },
      '100%': {
        'opacity': '1',
        'transform': 'translateX(0) translateY(0) scale(1)',
        'z-index': '3',
      },
    },
  },
  'spin': {
    '@keyframes jumi-spin': {
      '0%': {
        transform: 'rotateX(0deg) rotateY(0deg)',
      },
      '100%': {
        transform: 'rotateX(360deg) rotateY(360deg)',
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
  'spiral-path': {
    '@keyframes jumi-spiral-path': {
      '0%': {
        opacity: '0',
        transform: 'rotate(0deg) translateX(50px) rotate(0deg) scale(0.5)',
      },
      '25%': {
        opacity: '0.5',
        transform: 'rotate(90deg) translateX(30px) rotate(-90deg) scale(0.7)',
      },
      '50%': {
        opacity: '0.8',
        transform: 'rotate(180deg) translateX(15px) rotate(-180deg) scale(0.9)',
      },
      '75%': {
        opacity: '0.9',
        transform: 'rotate(270deg) translateX(5px) rotate(-270deg) scale(1.1)',
      },
      '100%': {
        opacity: '1',
        transform: 'rotate(360deg) translateX(0) rotate(-360deg) scale(1)',
      },
    },
  },
  'splash': {
    '@keyframes jumi-splash': {
      '0%': {
        'border-radius': '50%',
        'opacity': '0',
        'transform': 'scale(0.2) rotate(0deg)',
      },
      '30%': {
        'border-radius': '60% 40% 30% 70%',
        'opacity': '0.8',
        'transform': 'scale(1.2) rotate(5deg)',
      },
      '60%': {
        'border-radius': '40% 60% 70% 30%',
        'opacity': '1',
        'transform': 'scale(0.9) rotate(-3deg)',
      },
      '100%': {
        'border-radius': '50%',
        'opacity': '1',
        'transform': 'scale(1) rotate(0deg)',
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
  'tilt': {
    '@keyframes jumi-tilt': {
      '0%': {
        transform: 'rotateX(0deg) rotateY(0deg)',
      },
      '50%': {
        transform: 'rotateX(15deg) rotateY(15deg)',
      },
      '100%': {
        transform: 'rotateX(0deg) rotateY(0deg)',
      },
    },
  },
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
  'typing': {
    '@keyframes jumi-typing': {
      '0%': {
        width: '0',
      },
      '100%': {
        width: '100%',
      },
    },
  },
  'unfold-x': {
    '@keyframes jumi-unfold-x': {
      '0%': {
        'opacity': '0',
        'transform': 'scaleX(0) rotateY(90deg)',
        'transform-origin': 'center',
      },
      '50%': {
        opacity: '0.5',
        transform: 'scaleX(0.6) rotateY(45deg)',
      },
      '80%': {
        opacity: '0.9',
        transform: 'scaleX(1.1) rotateY(-5deg)',
      },
      '100%': {
        opacity: '1',
        transform: 'scaleX(1) rotateY(0deg)',
      },
    },
  },
  'unfold-y': {
    '@keyframes jumi-unfold-y': {
      '0%': {
        'opacity': '0',
        'transform': 'scaleY(0) rotateX(90deg)',
        'transform-origin': 'center',
      },
      '50%': {
        opacity: '0.5',
        transform: 'scaleY(0.6) rotateX(45deg)',
      },
      '80%': {
        opacity: '0.9',
        transform: 'scaleY(1.1) rotateX(-5deg)',
      },
      '100%': {
        opacity: '1',
        transform: 'scaleY(1) rotateX(0deg)',
      },
    },
  },
  'unmask': {
    '@keyframes jumi-unmask': {
      '0%': {
        'clip-path': 'polygon(0 40%, 100% 40%, 100% 60%, 0 60%)',
      },
      '100%': {
        'clip-path': 'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
      },
    },
  },
  'unmask-bottom': {
    '@keyframes jumi-unmask-bottom': {
      '0%': {
        'clip-path': 'polygon(0 100%, 100% 100%, 100% 100%, 0 100%)',
      },
      '100%': {
        'clip-path': 'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
      },
    },
  },
  'unmask-bottom-left': {
    '@keyframes jumi-unmask-bottom-left': {
      '0%': {
        'clip-path': 'polygon(0 100%, 0 100%, 0 100%, 0 100%)',
      },
      '100%': {
        'clip-path': 'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
      },
    },
  },
  'unmask-bottom-right': {
    '@keyframes jumi-unmask-bottom-right': {
      '0%': {
        'clip-path': 'polygon(100% 100%, 100% 100%, 100% 100%, 100% 100%)',
      },
      '100%': {
        'clip-path': 'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
      },
    },
  },
  'unmask-left': {
    '@keyframes jumi-unmask-left': {
      '0%': {
        'clip-path': 'polygon(0 0, 0 0, 0 100%, 0 100%)',
      },
      '100%': {
        'clip-path': 'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
      },
    },
  },
  'unmask-right': {
    '@keyframes jumi-unmask-right': {
      '0%': {
        'clip-path': 'polygon(100% 0, 100% 0, 100% 100%, 100% 100%)',
      },
      '100%': {
        'clip-path': 'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
      },
    },
  },
  'unmask-top': {
    '@keyframes jumi-unmask-top': {
      '0%': {
        'clip-path': 'polygon(0 0, 100% 0, 100% 0, 0 0)',
      },
      '100%': {
        'clip-path': 'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
      },
    },
  },
  'unmask-top-left': {
    '@keyframes jumi-unmask-top-left': {
      '0%': {
        'clip-path': 'polygon(0 0, 0 0, 0 0, 0 0)',
      },
      '100%': {
        'clip-path': 'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
      },
    },
  },
  'unmask-top-right': {
    '@keyframes jumi-unmask-top-right': {
      '0%': {
        'clip-path': 'polygon(100% 0, 100% 0, 100% 0, 100% 0)',
      },
      '100%': {
        'clip-path': 'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
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
  'wobbling': {
    '@keyframes jumi-wobbling': {
      '0%': {
        transform: 'rotateX(0deg) rotateY(0deg)',
      },
      '25%': {
        transform: 'rotateX(-10deg) rotateY(10deg)',
      },
      '75%': {
        transform: 'rotateX(10deg) rotateY(-10deg)',
      },
      '100%': {
        transform: 'rotateX(0deg) rotateY(0deg)',
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
  'zoom-in': {
    '@keyframes jumi-zoom-in': {
      '0%': {
        opacity: '0',
        transform: 'scale3d(0.3, 0.3, 0.3)',
      },
      '50%': {
        opacity: '1',
        transform: 'scale3d(1.08, 1.08, 1.08)',
      },
      '100%': {
        opacity: '1',
        transform: 'scale3d(1, 1, 1)',
      },
    },
  },
  'zoom-in-down': {
    '@keyframes jumi-zoom-in-down': {
      '0%': {
        opacity: '0',
        transform: 'scale3d(0.3, 0.3, 0.3) translate3d(0, -100%, 0)',
      },
      '50%': {
        opacity: '1',
        transform: 'scale3d(1.08, 1.08, 1.08) translate3d(0, 30%, 0)',
      },
      '100%': {
        opacity: '1',
        transform: 'scale3d(1, 1, 1) translate3d(0, 0, 0)',
      },
    },
  },
  'zoom-in-elastic': {
    '@keyframes jumi-zoom-in-elastic': {
      '0%': {
        opacity: '0',
        transform: 'scale3d(0.1, 0.1, 0.1)',
      },
      '50%': {
        opacity: '1',
        transform: 'scale3d(1.3, 1.3, 1.3)',
      },
      '75%': {
        transform: 'scale3d(0.9, 0.9, 0.9)',
      },
      '90%': {
        transform: 'scale3d(1.05, 1.05, 1.05)',
      },
      '100%': {
        opacity: '1',
        transform: 'scale3d(1, 1, 1)',
      },
    },
  },
  'zoom-in-left': {
    '@keyframes jumi-zoom-in-left': {
      '0%': {
        opacity: '0',
        transform: 'scale3d(0.3, 0.3, 0.3) translate3d(-100%, 0, 0)',
      },
      '50%': {
        opacity: '1',
        transform: 'scale3d(1.08, 1.08, 1.08) translate3d(30%, 0, 0)',
      },
      '100%': {
        opacity: '1',
        transform: 'scale3d(1, 1, 1) translate3d(0, 0, 0)',
      },
    },
  },
  'zoom-in-right': {
    '@keyframes jumi-zoom-in-right': {
      '0%': {
        opacity: '0',
        transform: 'scale3d(0.3, 0.3, 0.3) translate3d(100%, 0, 0)',
      },
      '50%': {
        opacity: '1',
        transform: 'scale3d(1.08, 1.08, 1.08) translate3d(-30%, 0, 0)',
      },
      '100%': {
        opacity: '1',
        transform: 'scale3d(1, 1, 1) translate3d(0, 0, 0)',
      },
    },
  },
  'zoom-in-up': {
    '@keyframes jumi-zoom-in-up': {
      '0%': {
        opacity: '0',
        transform: 'scale3d(0.3, 0.3, 0.3) translate3d(0, 100%, 0)',
      },
      '50%': {
        opacity: '1',
        transform: 'scale3d(1.08, 1.08, 1.08) translate3d(0, -30%, 0)',
      },
      '100%': {
        opacity: '1',
        transform: 'scale3d(1, 1, 1) translate3d(0, 0, 0)',
      },
    },
  },
  'zoom-out': {
    '@keyframes jumi-zoom-out': {
      '0%': {
        opacity: '1',
        transform: 'scale3d(1, 1, 1)',
      },
      '50%': {
        opacity: '1',
        transform: 'scale3d(0.92, 0.92, 0.92)',
      },
      '100%': {
        opacity: '0',
        transform: 'scale3d(0.2, 0.2, 0.2)',
      },
    },
  },
  'zoom-out-down': {
    '@keyframes jumi-zoom-out-down': {
      '0%': {
        opacity: '1',
        transform: 'scale3d(1, 1, 1) translate3d(0, 0, 0)',
      },
      '50%': {
        opacity: '1',
        transform: 'scale3d(0.92, 0.92, 0.92) translate3d(0, 30%, 0)',
      },
      '100%': {
        opacity: '0',
        transform: 'scale3d(0.2, 0.2, 0.2) translate3d(0, 100%, 0)',
      },
    },
  },
  'zoom-out-elastic': {
    '@keyframes jumi-zoom-out-elastic': {
      '0%': {
        opacity: '1',
        transform: 'scale3d(1, 1, 1)',
      },
      '20%': {
        transform: 'scale3d(1.1, 1.1, 1.1)',
      },
      '50%': {
        opacity: '1',
        transform: 'scale3d(0.7, 0.7, 0.7)',
      },
      '75%': {
        transform: 'scale3d(1.3, 1.3, 1.3)',
      },
      '100%': {
        opacity: '0',
        transform: 'scale3d(0.1, 0.1, 0.1)',
      },
    },
  },
  'zoom-out-left': {
    '@keyframes jumi-zoom-out-left': {
      '0%': {
        opacity: '1',
        transform: 'scale3d(1, 1, 1) translate3d(0, 0, 0)',
      },
      '50%': {
        opacity: '1',
        transform: 'scale3d(0.92, 0.92, 0.92) translate3d(-30%, 0, 0)',
      },
      '100%': {
        opacity: '0',
        transform: 'scale3d(0.2, 0.2, 0.2) translate3d(-100%, 0, 0)',
      },
    },
  },
  'zoom-out-right': {
    '@keyframes jumi-zoom-out-right': {
      '0%': {
        opacity: '1',
        transform: 'scale3d(1, 1, 1) translate3d(0, 0, 0)',
      },
      '50%': {
        opacity: '1',
        transform: 'scale3d(0.92, 0.92, 0.92) translate3d(30%, 0, 0)',
      },
      '100%': {
        opacity: '0',
        transform: 'scale3d(0.2, 0.2, 0.2) translate3d(100%, 0, 0)',
      },
    },
  },
  'zoom-out-up': {
    '@keyframes jumi-zoom-out-up': {
      '0%': {
        opacity: '1',
        transform: 'scale3d(1, 1, 1) translate3d(0, 0, 0)',
      },
      '50%': {
        opacity: '1',
        transform: 'scale3d(0.92, 0.92, 0.92) translate3d(0, -30%, 0)',
      },
      '100%': {
        opacity: '0',
        transform: 'scale3d(0.2, 0.2, 0.2) translate3d(0, -100%, 0)',
      },
    },
  },
  'zoom-pulse': {
    '@keyframes jumi-zoom-pulse': {
      '0%': {
        transform: 'scale3d(1, 1, 1)',
      },
      '50%': {
        transform: 'scale3d(1.05, 1.05, 1.05)',
      },
      '100%': {
        transform: 'scale3d(1, 1, 1)',
      },
    },
  },
  'zoom-pulse-grow': {
    '@keyframes jumi-zoom-pulse-grow': {
      '0%': {
        transform: 'scale3d(1, 1, 1)',
      },
      '50%': {
        transform: 'scale3d(1.1, 1.1, 1.1)',
      },
      '100%': {
        transform: 'scale3d(1, 1, 1)',
      },
    },
  },
  'zoom-pulse-shrink': {
    '@keyframes jumi-zoom-pulse-shrink': {
      '0%': {
        transform: 'scale3d(1, 1, 1)',
      },
      '50%': {
        transform: 'scale3d(0.95, 0.95, 0.95)',
      },
      '100%': {
        transform: 'scale3d(1, 1, 1)',
      },
    },
  },
  'zoom-tilt-in': {
    '@keyframes jumi-zoom-tilt-in': {
      '0%': {
        opacity: '0',
        transform: 'scale3d(0.3, 0.3, 0.3) rotateX(30deg)',
      },
      '50%': {
        opacity: '1',
        transform: 'scale3d(1.1, 1.1, 1.1) rotateX(15deg)',
      },
      '100%': {
        opacity: '1',
        transform: 'scale3d(1, 1, 1) rotateX(0deg)',
      },
    },
  },
  'zoom-tilt-out': {
    '@keyframes jumi-zoom-tilt-out': {
      '0%': {
        opacity: '1',
        transform: 'scale3d(1, 1, 1) rotateX(0deg)',
      },
      '50%': {
        opacity: '1',
        transform: 'scale3d(0.9, 0.9, 0.9) rotateX(-15deg)',
      },
      '100%': {
        opacity: '0',
        transform: 'scale3d(0.2, 0.2, 0.2) rotateX(-30deg)',
      },
    },
  },
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
