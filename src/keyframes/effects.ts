const backEffect = {
  'back-in': {
    '@keyframes jumi-back-in': {
      '0%': {
        opacity: '0',
        transform: 'scale(0.3) rotateZ(-270deg)',
        transformOrigin: 'center center',
      },
      '30%': {
        opacity: '0.8',
        transform: 'scale(0.8) rotateZ(-180deg)',
      },
      '70%': {
        opacity: '1',
        transform: 'scale(1.05) rotateZ(-45deg)',
      },
      '100%': {
        opacity: '1',
        transform: 'scale(1) rotateZ(0deg)',
      },
    },
  },
  'back-in-bottom-left': {
    '@keyframes jumi-back-in-bottom-left': {
      '0%': {
        opacity: '0',
        transform: 'scale(0.2) translate(-800px, 800px) rotateZ(270deg)',
        transformOrigin: 'top right',
      },
      '50%': {
        opacity: '1',
        transform: 'scale(1.1) translate(-100px, 100px) rotateZ(135deg)',
        transformOrigin: 'top right',
      },
      '100%': {
        opacity: '1',
        transform: 'scale(1) translate(0, 0) rotateZ(0deg)',
        transformOrigin: 'top right',
      },
    },
  },
  'back-in-bottom-right': {
    '@keyframes jumi-back-in-bottom-right': {
      '0%': {
        opacity: '0',
        transform: 'scale(0.2) translate(800px, 800px) rotateZ(-270deg)',
        transformOrigin: 'top left',
      },
      '50%': {
        opacity: '1',
        transform: 'scale(1.1) translate(100px, 100px) rotateZ(-135deg)',
        transformOrigin: 'top left',
      },
      '100%': {
        opacity: '1',
        transform: 'scale(1) translate(0, 0) rotateZ(0deg)',
        transformOrigin: 'top left',
      },
    },
  },
  'back-in-down': {
    '@keyframes jumi-back-in-down': {
      '0%': {
        opacity: '0',
        transform: 'scale(0.3) translateY(-1200px) rotateZ(-270deg)',
        transformOrigin: 'center bottom',
      },
      '30%': {
        opacity: '0.8',
        transform: 'scale(0.8) translateY(-600px) rotateZ(-180deg)',
        transformOrigin: 'center bottom',
      },
      '70%': {
        opacity: '1',
        transform: 'scale(1.05) translateY(-50px) rotateZ(-45deg)',
        transformOrigin: 'center bottom',
      },
      '100%': {
        opacity: '1',
        transform: 'scale(1) translateY(0) rotateZ(0deg)',
        transformOrigin: 'center bottom',
      },
    },
  },
  'back-in-elastic': {
    '@keyframes jumi-back-in-elastic': {
      '0%': {
        opacity: '0',
        transform: 'scale(0) rotateZ(-540deg)',
      },
      '25%': {
        opacity: '1',
        transform: 'scale(1.3) rotateZ(-360deg)',
      },
      '50%': {
        opacity: '1',
        transform: 'scale(0.9) rotateZ(-180deg)',
      },
      '75%': {
        opacity: '1',
        transform: 'scale(1.1) rotateZ(-90deg)',
      },
      '100%': {
        opacity: '1',
        transform: 'scale(1) rotateZ(0deg)',
      },
    },
  },
  'back-in-left': {
    '@keyframes jumi-back-in-left': {
      '0%': {
        opacity: '0',
        transform: 'scale(0.3) translateX(-1200px) rotateZ(-270deg)',
        transformOrigin: 'right center',
      },
      '30%': {
        opacity: '0.8',
        transform: 'scale(0.8) translateX(-600px) rotateZ(-180deg)',
        transformOrigin: 'right center',
      },
      '70%': {
        opacity: '1',
        transform: 'scale(1.05) translateX(-50px) rotateZ(-45deg)',
        transformOrigin: 'right center',
      },
      '100%': {
        opacity: '1',
        transform: 'scale(1) translateX(0) rotateZ(0deg)',
        transformOrigin: 'right center',
      },
    },
  },
  'back-in-right': {
    '@keyframes jumi-back-in-right': {
      '0%': {
        opacity: '0',
        transform: 'scale(0.3) translateX(1200px) rotateZ(270deg)',
        transformOrigin: 'left center',
      },
      '30%': {
        opacity: '0.8',
        transform: 'scale(0.8) translateX(600px) rotateZ(180deg)',
        transformOrigin: 'left center',
      },
      '70%': {
        opacity: '1',
        transform: 'scale(1.05) translateX(50px) rotateZ(45deg)',
        transformOrigin: 'left center',
      },
      '100%': {
        opacity: '1',
        transform: 'scale(1) translateX(0) rotateZ(0deg)',
        transformOrigin: 'left center',
      },
    },
  },

  'back-in-top-left': {
    '@keyframes jumi-back-in-top-left': {
      '0%': {
        opacity: '0',
        transform: 'scale(0.2) translate(-800px, -800px) rotateZ(-270deg)',
        transformOrigin: 'bottom right',
      },
      '50%': {
        opacity: '1',
        transform: 'scale(1.1) translate(-100px, -100px) rotateZ(-135deg)',
        transformOrigin: 'bottom right',
      },
      '100%': {
        opacity: '1',
        transform: 'scale(1) translate(0, 0) rotateZ(0deg)',
        transformOrigin: 'bottom right',
      },
    },
  },
  'back-in-top-right': {
    '@keyframes jumi-back-in-top-right': {
      '0%': {
        opacity: '0',
        transform: 'scale(0.2) translate(800px, -800px) rotateZ(270deg)',
        transformOrigin: 'bottom left',
      },
      '50%': {
        opacity: '1',
        transform: 'scale(1.1) translate(100px, -100px) rotateZ(135deg)',
        transformOrigin: 'bottom left',
      },
      '100%': {
        opacity: '1',
        transform: 'scale(1) translate(0, 0) rotateZ(0deg)',
        transformOrigin: 'bottom left',
      },
    },
  },
  'back-in-up': {
    '@keyframes jumi-back-in-up': {
      '0%': {
        opacity: '0',
        transform: 'scale(0.3) translateY(1200px) rotateZ(270deg)',
        transformOrigin: 'center top',
      },
      '30%': {
        opacity: '0.8',
        transform: 'scale(0.8) translateY(600px) rotateZ(180deg)',
        transformOrigin: 'center top',
      },
      '70%': {
        opacity: '1',
        transform: 'scale(1.05) translateY(50px) rotateZ(45deg)',
        transformOrigin: 'center top',
      },
      '100%': {
        opacity: '1',
        transform: 'scale(1) translateY(0) rotateZ(0deg)',
        transformOrigin: 'center top',
      },
    },
  },

  'back-out': {
    '@keyframes jumi-back-out': {
      '0%': {
        opacity: '1',
        transform: 'scale(1) rotateZ(0deg)',
        transformOrigin: 'center center',
      },
      '30%': {
        opacity: '0.8',
        transform: 'scale(1.1) rotateZ(90deg)',
      },
      '70%': {
        opacity: '0.3',
        transform: 'scale(0.5) rotateZ(270deg)',
      },
      '100%': {
        opacity: '0',
        transform: 'scale(0.1) rotateZ(360deg)',
      },
    },
  },
  'back-out-down': {
    '@keyframes jumi-back-out-down': {
      '0%': {
        opacity: '1',
        transform: 'scale(1) translateY(0) rotateZ(0deg)',
        transformOrigin: 'center top',
      },
      '30%': {
        opacity: '0.8',
        transform: 'scale(1.1) translateY(200px) rotateZ(90deg)',
        transformOrigin: 'center top',
      },
      '70%': {
        opacity: '0.3',
        transform: 'scale(0.5) translateY(800px) rotateZ(270deg)',
        transformOrigin: 'center top',
      },
      '100%': {
        opacity: '0',
        transform: 'scale(0.1) translateY(1200px) rotateZ(360deg)',
        transformOrigin: 'center top',
      },
    },
  },
  'back-out-elastic': {
    '@keyframes jumi-back-out-elastic': {
      '0%': {
        opacity: '1',
        transform: 'scale(1) rotateZ(0deg)',
      },
      '25%': {
        opacity: '1',
        transform: 'scale(0.9) rotateZ(90deg)',
      },
      '50%': {
        opacity: '1',
        transform: 'scale(1.2) rotateZ(270deg)',
      },
      '75%': {
        opacity: '0.8',
        transform: 'scale(0.8) rotateZ(450deg)',
      },
      '100%': {
        opacity: '0',
        transform: 'scale(0) rotateZ(540deg)',
      },
    },
  },
  'back-out-left': {
    '@keyframes jumi-back-out-left': {
      '0%': {
        opacity: '1',
        transform: 'scale(1) translateX(0) rotateZ(0deg)',
        transformOrigin: 'right center',
      },
      '30%': {
        opacity: '0.8',
        transform: 'scale(1.1) translateX(-200px) rotateZ(-90deg)',
        transformOrigin: 'right center',
      },
      '70%': {
        opacity: '0.3',
        transform: 'scale(0.5) translateX(-800px) rotateZ(-270deg)',
        transformOrigin: 'right center',
      },
      '100%': {
        opacity: '0',
        transform: 'scale(0.1) translateX(-1200px) rotateZ(-360deg)',
        transformOrigin: 'right center',
      },
    },
  },
  'back-out-right': {
    '@keyframes jumi-back-out-right': {
      '0%': {
        opacity: '1',
        transform: 'scale(1) translateX(0) rotateZ(0deg)',
        transformOrigin: 'left center',
      },
      '30%': {
        opacity: '0.8',
        transform: 'scale(1.1) translateX(200px) rotateZ(90deg)',
        transformOrigin: 'left center',
      },
      '70%': {
        opacity: '0.3',
        transform: 'scale(0.5) translateX(800px) rotateZ(270deg)',
        transformOrigin: 'left center',
      },
      '100%': {
        opacity: '0',
        transform: 'scale(0.1) translateX(1200px) rotateZ(360deg)',
        transformOrigin: 'left center',
      },
    },
  },
  'back-out-up': {
    '@keyframes jumi-back-out-up': {
      '0%': {
        opacity: '1',
        transform: 'scale(1) translateY(0) rotateZ(0deg)',
        transformOrigin: 'center bottom',
      },
      '30%': {
        opacity: '0.8',
        transform: 'scale(1.1) translateY(-200px) rotateZ(-90deg)',
        transformOrigin: 'center bottom',
      },
      '70%': {
        opacity: '0.3',
        transform: 'scale(0.5) translateY(-800px) rotateZ(-270deg)',
        transformOrigin: 'center bottom',
      },
      '100%': {
        opacity: '0',
        transform: 'scale(0.1) translateY(-1200px) rotateZ(-360deg)',
        transformOrigin: 'center bottom',
      },
    },
  },
}

const bounceEffect = {
  'bounce-attention': {
    '@keyframes jumi-bounce-attention': {
      '0%, 20%, 50%, 80%, 100%': {
        transform: 'translateY(0) scale(1)',
      },
      '40%': {
        transform: 'translateY(-15px) scale(1.05)',
      },
      '60%': {
        transform: 'translateY(-8px) scale(1.02)',
      },
    },
  },

  'bounce-gentle': {
    '@keyframes jumi-bounce-gentle': {
      '0%': {
        transform: 'scale3d(1, 1, 1)',
      },
      '30%': {
        transform: 'scale3d(1.05, 0.95, 1)',
      },
      '40%': {
        transform: 'scale3d(0.95, 1.05, 1)',
      },
      '50%': {
        transform: 'scale3d(1.02, 0.98, 1)',
      },
      '65%': {
        transform: 'scale3d(0.98, 1.02, 1)',
      },
      '75%': {
        transform: 'scale3d(1.01, 0.99, 1)',
      },
      '100%': {
        transform: 'scale3d(1, 1, 1)',
      },
    },
  },
  'bounce-heartbeat': {
    '@keyframes jumi-bounce-heartbeat': {
      '0%': {
        transform: 'scale(1)',
      },
      '14%': {
        transform: 'scale(1.3)',
      },
      '28%': {
        transform: 'scale(1)',
      },
      '42%': {
        transform: 'scale(1.3)',
      },
      '70%': {
        transform: 'scale(1)',
      },
    },
  },
  'bounce-in': {
    '@keyframes jumi-bounce-in': {
      '0%': {
        opacity: '0',
        transform: 'scale3d(0.3, 0.3, 0.3)',
      },
      '20%': {
        opacity: '1',
        transform: 'scale3d(1.15, 1.15, 1.15)',
      },
      '40%': {
        transform: 'scale3d(0.9, 0.9, 0.9)',
      },
      '60%': {
        opacity: '1',
        transform: 'scale3d(1.05, 1.05, 1.05)',
      },
      '80%': {
        transform: 'scale3d(0.98, 0.98, 0.98)',
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
        transform: 'translate3d(0, -800px, 0) scaleY(1.5)',
      },
      '60%': {
        opacity: '1',
        transform: 'translate3d(0, 25px, 0) scaleY(0.9)',
      },
      '75%': {
        transform: 'translate3d(0, -10px, 0) scaleY(1.05)',
      },
      '90%': {
        transform: 'translate3d(0, 5px, 0) scaleY(0.98)',
      },
      '100%': {
        opacity: '1',
        transform: 'translate3d(0, 0, 0) scaleY(1)',
      },
    },
  },
  'bounce-in-left': {
    '@keyframes jumi-bounce-in-left': {
      '0%': {
        opacity: '0',
        transform: 'translate3d(-800px, 0, 0) scaleX(1.5)',
      },
      '60%': {
        opacity: '1',
        transform: 'translate3d(25px, 0, 0) scaleX(0.9)',
      },
      '75%': {
        transform: 'translate3d(-10px, 0, 0) scaleX(1.05)',
      },
      '90%': {
        transform: 'translate3d(5px, 0, 0) scaleX(0.98)',
      },
      '100%': {
        opacity: '1',
        transform: 'translate3d(0, 0, 0) scaleX(1)',
      },
    },
  },
  'bounce-in-right': {
    '@keyframes jumi-bounce-in-right': {
      '0%': {
        opacity: '0',
        transform: 'translate3d(800px, 0, 0) scaleX(1.5)',
      },
      '60%': {
        opacity: '1',
        transform: 'translate3d(-25px, 0, 0) scaleX(0.9)',
      },
      '75%': {
        transform: 'translate3d(10px, 0, 0) scaleX(1.05)',
      },
      '90%': {
        transform: 'translate3d(-5px, 0, 0) scaleX(0.98)',
      },
      '100%': {
        opacity: '1',
        transform: 'translate3d(0, 0, 0) scaleX(1)',
      },
    },
  },
  'bounce-in-up': {
    '@keyframes jumi-bounce-in-up': {
      '0%': {
        opacity: '0',
        transform: 'translate3d(0, 800px, 0) scaleY(1.5)',
      },
      '60%': {
        opacity: '1',
        transform: 'translate3d(0, -25px, 0) scaleY(0.9)',
      },
      '75%': {
        transform: 'translate3d(0, 10px, 0) scaleY(1.05)',
      },
      '90%': {
        transform: 'translate3d(0, -5px, 0) scaleY(0.98)',
      },
      '100%': {
        opacity: '1',
        transform: 'translate3d(0, 0, 0) scaleY(1)',
      },
    },
  },
  'bounce-jello': {
    '@keyframes jumi-bounce-jello': {
      '0%': {
        transform: 'scale3d(1, 1, 1)',
      },
      '30%': {
        transform: 'scale3d(1.25, 0.75, 1)',
      },
      '40%': {
        transform: 'scale3d(0.75, 1.25, 1)',
      },
      '50%': {
        transform: 'scale3d(1.15, 0.85, 1)',
      },
      '65%': {
        transform: 'scale3d(0.95, 1.05, 1)',
      },
      '75%': {
        transform: 'scale3d(1.05, 0.95, 1)',
      },
      '100%': {
        transform: 'scale3d(1, 1, 1)',
      },
    },
  },
  'bounce-out': {
    '@keyframes jumi-bounce-out': {
      '0%': {
        opacity: '1',
        transform: 'scale3d(1, 1, 1)',
      },
      '20%': {
        transform: 'scale3d(0.95, 0.95, 0.95)',
      },
      '50%': {
        opacity: '1',
        transform: 'scale3d(1.15, 1.15, 1.15)',
      },
      '55%': {
        transform: 'scale3d(1.15, 1.15, 1.15)',
      },
      '100%': {
        opacity: '0',
        transform: 'scale3d(0.2, 0.2, 0.2)',
      },
    },
  },

  'bounce-out-down': {
    '@keyframes jumi-bounce-out-down': {
      '0%': {
        opacity: '1',
        transform: 'translate3d(0, 0, 0)',
      },
      '20%': {
        transform: 'translate3d(0, 10px, 0) scaleY(0.985)',
      },
      '40%': {
        opacity: '1',
        transform: 'translate3d(0, -20px, 0) scaleY(0.9)',
      },
      '45%': {
        transform: 'translate3d(0, -20px, 0) scaleY(0.9)',
      },
      '100%': {
        opacity: '0',
        transform: 'translate3d(0, 800px, 0) scaleY(2)',
      },
    },
  },
  'bounce-out-left': {
    '@keyframes jumi-bounce-out-left': {
      '0%': {
        opacity: '1',
        transform: 'translate3d(0, 0, 0)',
      },
      '20%': {
        transform: 'translate3d(20px, 0, 0) scaleX(0.9)',
      },
      '100%': {
        opacity: '0',
        transform: 'translate3d(-800px, 0, 0) scaleX(2)',
      },
    },
  },
  'bounce-out-right': {
    '@keyframes jumi-bounce-out-right': {
      '0%': {
        opacity: '1',
        transform: 'translate3d(0, 0, 0)',
      },
      '20%': {
        transform: 'translate3d(-20px, 0, 0) scaleX(0.9)',
      },
      '100%': {
        opacity: '0',
        transform: 'translate3d(800px, 0, 0) scaleX(2)',
      },
    },
  },
  'bounce-out-up': {
    '@keyframes jumi-bounce-out-up': {
      '0%': {
        opacity: '1',
        transform: 'translate3d(0, 0, 0)',
      },
      '20%': {
        transform: 'translate3d(0, -10px, 0) scaleY(0.985)',
      },
      '40%': {
        opacity: '1',
        transform: 'translate3d(0, 20px, 0) scaleY(0.9)',
      },
      '45%': {
        transform: 'translate3d(0, 20px, 0) scaleY(0.9)',
      },
      '100%': {
        opacity: '0',
        transform: 'translate3d(0, -800px, 0) scaleY(2)',
      },
    },
  },
  'bounce-pulse': {
    '@keyframes jumi-bounce-pulse': {
      '0%': {
        boxShadow: '0 0 0 0 rgba(59, 130, 246, 0.7)',
        transform: 'scale3d(1, 1, 1)',
      },
      '25%': {
        boxShadow: '0 0 0 8px rgba(59, 130, 246, 0.4)',
        transform: 'scale3d(1.1, 1.1, 1.1)',
      },
      '50%': {
        boxShadow: '0 0 0 15px rgba(59, 130, 246, 0.1)',
        transform: 'scale3d(1, 1, 1)',
      },
      '75%': {
        boxShadow: '0 0 0 20px rgba(59, 130, 246, 0)',
        transform: 'scale3d(0.95, 0.95, 0.95)',
      },
      '100%': {
        boxShadow: '0 0 0 0 rgba(59, 130, 246, 0)',
        transform: 'scale3d(1, 1, 1)',
      },
    },
  },
}

const fadeEffect = {
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
  'fade-in-down-big': {
    '@keyframes jumi-fade-in-down-big': {
      '0%': {
        opacity: '0',
        transform: 'translate3d(0, -120px, 0)',
      },
      '100%': {
        opacity: '1',
        transform: 'translate3d(0, 0, 0)',
      },
    },
  },
  'fade-in-down-left': {
    '@keyframes jumi-fade-in-down-left': {
      '0%': {
        opacity: '0',
        transform: 'translate3d(-60px, -60px, 0)',
      },
      '100%': {
        opacity: '1',
        transform: 'translate3d(0, 0, 0)',
      },
    },
  },
  'fade-in-down-micro': {
    '@keyframes jumi-fade-in-down-micro': {
      '0%': {
        opacity: '0',
        transform: 'translate3d(0, -20px, 0)',
      },
      '100%': {
        opacity: '1',
        transform: 'translate3d(0, 0, 0)',
      },
    },
  },
  'fade-in-down-right': {
    '@keyframes jumi-fade-in-down-right': {
      '0%': {
        opacity: '0',
        transform: 'translate3d(60px, -60px, 0)',
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
  'fade-in-left-big': {
    '@keyframes jumi-fade-in-left-big': {
      '0%': {
        opacity: '0',
        transform: 'translate3d(-120px, 0, 0)',
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
  'fade-in-right-big': {
    '@keyframes jumi-fade-in-right-big': {
      '0%': {
        opacity: '0',
        transform: 'translate3d(120px, 0, 0)',
      },
      '100%': {
        opacity: '1',
        transform: 'translate3d(0, 0, 0)',
      },
    },
  },
  'fade-in-rotate': {
    '@keyframes jumi-fade-in-rotate': {
      '0%': {
        opacity: '0',
        transform: 'rotate(-10deg) scale(0.95)',
        transformOrigin: 'center center',
      },
      '100%': {
        opacity: '1',
        transform: 'rotate(0deg) scale(1)',
        transformOrigin: 'center center',
      },
    },
  },
  'fade-in-scale': {
    '@keyframes jumi-fade-in-scale': {
      '0%': {
        opacity: '0',
        transform: 'scale3d(0.8, 0.8, 1)',
      },
      '100%': {
        opacity: '1',
        transform: 'scale3d(1, 1, 1)',
      },
    },
  },
  'fade-in-scale-up': {
    '@keyframes jumi-fade-in-scale-up': {
      '0%': {
        opacity: '0',
        transform: 'scale3d(1.2, 1.2, 1)',
      },
      '100%': {
        opacity: '1',
        transform: 'scale3d(1, 1, 1)',
      },
    },
  },
  'fade-in-smooth': {
    '@keyframes jumi-fade-in-smooth': {
      '0%': {
        opacity: '0',
        transform: 'translate3d(0, 30px, 0)',
      },
      '50%': {
        opacity: '0.8',
        transform: 'translate3d(0, 15px, 0)',
      },
      '100%': {
        opacity: '1',
        transform: 'translate3d(0, 0, 0)',
      },
    },
  },

  'fade-in-stagger': {
    '@keyframes jumi-fade-in-stagger': {
      '0%': {
        opacity: '0',
        transform: 'translate3d(0, 40px, 0)',
      },
      '60%': {
        opacity: '0.6',
        transform: 'translate3d(0, 20px, 0)',
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
  'fade-in-up-big': {
    '@keyframes jumi-fade-in-up-big': {
      '0%': {
        opacity: '0',
        transform: 'translate3d(0, 120px, 0)',
      },
      '100%': {
        opacity: '1',
        transform: 'translate3d(0, 0, 0)',
      },
    },
  },
  'fade-in-up-left': {
    '@keyframes jumi-fade-in-up-left': {
      '0%': {
        opacity: '0',
        transform: 'translate3d(-60px, 60px, 0)',
      },
      '100%': {
        opacity: '1',
        transform: 'translate3d(0, 0, 0)',
      },
    },
  },

  'fade-in-up-micro': {
    '@keyframes jumi-fade-in-up-micro': {
      '0%': {
        opacity: '0',
        transform: 'translate3d(0, 20px, 0)',
      },
      '100%': {
        opacity: '1',
        transform: 'translate3d(0, 0, 0)',
      },
    },
  },
  'fade-in-up-right': {
    '@keyframes jumi-fade-in-up-right': {
      '0%': {
        opacity: '0',
        transform: 'translate3d(60px, 60px, 0)',
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
  'fade-out-rotate': {
    '@keyframes jumi-fade-out-rotate': {
      '0%': {
        opacity: '1',
        transform: 'rotate(0deg) scale(1)',
        transformOrigin: 'center center',
      },
      '100%': {
        opacity: '0',
        transform: 'rotate(10deg) scale(0.95)',
        transformOrigin: 'center center',
      },
    },
  },
  'fade-out-scale': {
    '@keyframes jumi-fade-out-scale': {
      '0%': {
        opacity: '1',
        transform: 'scale3d(1, 1, 1)',
      },
      '100%': {
        opacity: '0',
        transform: 'scale3d(0.8, 0.8, 1)',
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
}

const flipEffect = {
  'flip-card-x': {
    '@keyframes jumi-flip-card-x': {
      '0%': {
        backfaceVisibility: 'hidden',
        transform: 'perspective(1000px) rotateX(0deg)',
      },
      '50%': {
        backfaceVisibility: 'hidden',
        transform: 'perspective(1000px) rotateX(90deg)',
      },
      '100%': {
        backfaceVisibility: 'hidden',
        transform: 'perspective(1000px) rotateX(180deg)',
      },
    },
  },
  'flip-card-y': {
    '@keyframes jumi-flip-card-y': {
      '0%': {
        backfaceVisibility: 'hidden',
        transform: 'perspective(1000px) rotateY(0deg)',
      },
      '50%': {
        backfaceVisibility: 'hidden',
        transform: 'perspective(1000px) rotateY(90deg)',
      },
      '100%': {
        backfaceVisibility: 'hidden',
        transform: 'perspective(1000px) rotateY(180deg)',
      },
    },
  },
  'flip-diagonal': {
    '@keyframes jumi-flip-diagonal': {
      '0%': {
        transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg)',
      },
      '50%': {
        transform: 'perspective(1000px) rotateX(90deg) rotateY(90deg)',
      },
      '100%': {
        transform: 'perspective(1000px) rotateX(180deg) rotateY(180deg)',
      },
    },
  },

  'flip-elastic-x': {
    '@keyframes jumi-flip-elastic-x': {
      '0%': {
        transform: 'perspective(800px) rotateX(0deg)',
      },
      '20%': {
        transform: 'perspective(800px) rotateX(200deg)',
      },
      '40%': {
        transform: 'perspective(800px) rotateX(160deg)',
      },
      '60%': {
        transform: 'perspective(800px) rotateX(190deg)',
      },
      '80%': {
        transform: 'perspective(800px) rotateX(175deg)',
      },
      '100%': {
        transform: 'perspective(800px) rotateX(180deg)',
      },
    },
  },
  'flip-elastic-y': {
    '@keyframes jumi-flip-elastic-y': {
      '0%': {
        transform: 'perspective(800px) rotateY(0deg)',
      },
      '20%': {
        transform: 'perspective(800px) rotateY(200deg)',
      },
      '40%': {
        transform: 'perspective(800px) rotateY(160deg)',
      },
      '60%': {
        transform: 'perspective(800px) rotateY(190deg)',
      },
      '80%': {
        transform: 'perspective(800px) rotateY(175deg)',
      },
      '100%': {
        transform: 'perspective(800px) rotateY(180deg)',
      },
    },
  },
  'flip-in-bottom': {
    '@keyframes jumi-flip-in-bottom': {
      '40%': {
        opacity: '1',
        transform: 'perspective(600px) rotateX(15deg)',
        transformOrigin: 'center top',
      },
      '70%': {
        transform: 'perspective(600px) rotateX(-8deg)',
        transformOrigin: 'center top',
      },
      'from': {
        opacity: '0',
        transform: 'perspective(600px) rotateX(-90deg)',
        transformOrigin: 'center top',
      },
      'to': {
        opacity: '1',
        transform: 'perspective(600px) rotateX(0deg)',
        transformOrigin: 'center top',
      },
    },
  },
  'flip-in-left': {
    '@keyframes jumi-flip-in-left': {
      '40%': {
        opacity: '1',
        transform: 'perspective(600px) rotateY(-15deg)',
        transformOrigin: 'right center',
      },
      '70%': {
        transform: 'perspective(600px) rotateY(8deg)',
        transformOrigin: 'right center',
      },
      'from': {
        opacity: '0',
        transform: 'perspective(600px) rotateY(90deg)',
        transformOrigin: 'right center',
      },
      'to': {
        opacity: '1',
        transform: 'perspective(600px) rotateY(0deg)',
        transformOrigin: 'right center',
      },
    },
  },
  'flip-in-right': {
    '@keyframes jumi-flip-in-right': {
      '40%': {
        opacity: '1',
        transform: 'perspective(600px) rotateY(15deg)',
        transformOrigin: 'left center',
      },
      '70%': {
        transform: 'perspective(600px) rotateY(-8deg)',
        transformOrigin: 'left center',
      },
      'from': {
        opacity: '0',
        transform: 'perspective(600px) rotateY(-90deg)',
        transformOrigin: 'left center',
      },
      'to': {
        opacity: '1',
        transform: 'perspective(600px) rotateY(0deg)',
        transformOrigin: 'left center',
      },
    },
  },
  'flip-in-top': {
    '@keyframes jumi-flip-in-top': {
      '40%': {
        opacity: '1',
        transform: 'perspective(600px) rotateX(-15deg)',
        transformOrigin: 'center bottom',
      },
      '70%': {
        transform: 'perspective(600px) rotateX(8deg)',
        transformOrigin: 'center bottom',
      },
      'from': {
        opacity: '0',
        transform: 'perspective(600px) rotateX(90deg)',
        transformOrigin: 'center bottom',
      },
      'to': {
        opacity: '1',
        transform: 'perspective(600px) rotateX(0deg)',
        transformOrigin: 'center bottom',
      },
    },
  },

  'flip-in-x': {
    '@keyframes jumi-flip-in-x': {
      '40%': {
        opacity: '1',
        transform: 'perspective(600px) rotateX(20deg)',
      },
      '70%': {
        transform: 'perspective(600px) rotateX(-10deg)',
      },
      '90%': {
        transform: 'perspective(600px) rotateX(5deg)',
      },
      'from': {
        opacity: '0',
        transform: 'perspective(600px) rotateX(-90deg)',
      },
      'to': {
        opacity: '1',
        transform: 'perspective(600px) rotateX(0deg)',
      },
    },
  },
  'flip-in-y': {
    '@keyframes jumi-flip-in-y': {
      '40%': {
        opacity: '1',
        transform: 'perspective(600px) rotateY(20deg)',
      },
      '70%': {
        transform: 'perspective(600px) rotateY(-10deg)',
      },
      '90%': {
        transform: 'perspective(600px) rotateY(5deg)',
      },
      'from': {
        opacity: '0',
        transform: 'perspective(600px) rotateY(-90deg)',
      },
      'to': {
        opacity: '1',
        transform: 'perspective(600px) rotateY(0deg)',
      },
    },
  },

  'flip-wobble-x': {
    '@keyframes jumi-flip-wobble-x': {
      '0%': {
        transform: 'perspective(600px) rotateX(0deg)',
      },
      '15%': {
        transform: 'perspective(600px) rotateX(-25deg)',
      },
      '30%': {
        transform: 'perspective(600px) rotateX(15deg)',
      },
      '45%': {
        transform: 'perspective(600px) rotateX(-10deg)',
      },
      '60%': {
        transform: 'perspective(600px) rotateX(5deg)',
      },
      '75%': {
        transform: 'perspective(600px) rotateX(-2deg)',
      },
      '100%': {
        transform: 'perspective(600px) rotateX(0deg)',
      },
    },
  },
  'flip-wobble-y': {
    '@keyframes jumi-flip-wobble-y': {
      '0%': {
        transform: 'perspective(600px) rotateY(0deg)',
      },
      '15%': {
        transform: 'perspective(600px) rotateY(-25deg)',
      },
      '30%': {
        transform: 'perspective(600px) rotateY(15deg)',
      },
      '45%': {
        transform: 'perspective(600px) rotateY(-10deg)',
      },
      '60%': {
        transform: 'perspective(600px) rotateY(5deg)',
      },
      '75%': {
        transform: 'perspective(600px) rotateY(-2deg)',
      },
      '100%': {
        transform: 'perspective(600px) rotateY(0deg)',
      },
    },
  },

  'flip-x': {
    '@keyframes jumi-flip-x': {
      '0%': {
        transform: 'perspective(800px) rotateX(0deg)',
      },
      '100%': {
        transform: 'perspective(800px) rotateX(360deg)',
      },
    },
  },
  'flip-y': {
    '@keyframes jumi-flip-y': {
      '0%': {
        transform: 'perspective(800px) rotateY(0deg)',
      },
      '100%': {
        transform: 'perspective(800px) rotateY(360deg)',
      },
    },
  },

  'flip-zoom-x': {
    '@keyframes jumi-flip-zoom-x': {
      '0%': {
        opacity: '1',
        transform: 'perspective(800px) scale(1) rotateX(0deg)',
      },
      '50%': {
        opacity: '0.7',
        transform: 'perspective(800px) scale(0.8) rotateX(90deg)',
      },
      '100%': {
        opacity: '1',
        transform: 'perspective(800px) scale(1) rotateX(180deg)',
      },
    },
  },
  'flip-zoom-y': {
    '@keyframes jumi-flip-zoom-y': {
      '0%': {
        opacity: '1',
        transform: 'perspective(800px) scale(1) rotateY(0deg)',
      },
      '50%': {
        opacity: '0.7',
        transform: 'perspective(800px) scale(0.8) rotateY(90deg)',
      },
      '100%': {
        opacity: '1',
        transform: 'perspective(800px) scale(1) rotateY(180deg)',
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
  'slide-in-down-left': {
    '@keyframes jumi-slide-in-down-left': {
      '0%': {
        opacity: '0',
        transform: 'translate3d(-100%, -100%, 0)',
        visibility: 'visible',
      },
      '100%': {
        opacity: '1',
        transform: 'translate3d(0, 0, 0)',
      },
    },
  },
  'slide-in-down-right': {
    '@keyframes jumi-slide-in-down-right': {
      '0%': {
        opacity: '0',
        transform: 'translate3d(100%, -100%, 0)',
        visibility: 'visible',
      },
      '100%': {
        opacity: '1',
        transform: 'translate3d(0, 0, 0)',
      },
    },
  },
  'slide-in-down-scale': {
    '@keyframes jumi-slide-in-down-scale': {
      '0%': {
        opacity: '0',
        transform: 'translate3d(0, -100%, 0) scale(0.8)',
        visibility: 'visible',
      },
      '60%': {
        opacity: '1',
        transform: 'translate3d(0, -20%, 0) scale(1.05)',
      },
      '100%': {
        opacity: '1',
        transform: 'translate3d(0, 0, 0) scale(1)',
      },
    },
  },
  'slide-in-elastic-down': {
    '@keyframes jumi-slide-in-elastic-down': {
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
  'slide-in-elastic-up': {
    '@keyframes jumi-slide-in-elastic-up': {
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
  'slide-in-left-scale': {
    '@keyframes jumi-slide-in-left-scale': {
      '0%': {
        opacity: '0',
        transform: 'translate3d(-100%, 0, 0) scale(0.8)',
        visibility: 'visible',
      },
      '60%': {
        opacity: '1',
        transform: 'translate3d(-20%, 0, 0) scale(1.05)',
      },
      '100%': {
        opacity: '1',
        transform: 'translate3d(0, 0, 0) scale(1)',
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
  'slide-in-right-scale': {
    '@keyframes jumi-slide-in-right-scale': {
      '0%': {
        opacity: '0',
        transform: 'translate3d(100%, 0, 0) scale(0.8)',
        visibility: 'visible',
      },
      '60%': {
        opacity: '1',
        transform: 'translate3d(20%, 0, 0) scale(1.05)',
      },
      '100%': {
        opacity: '1',
        transform: 'translate3d(0, 0, 0) scale(1)',
      },
    },
  },

  'slide-in-rotate-left': {
    '@keyframes jumi-slide-in-rotate-left': {
      '0%': {
        opacity: '0',
        transform: 'translate3d(-100%, 0, 0) rotate(-15deg)',
        transformOrigin: 'right center',
        visibility: 'visible',
      },
      '100%': {
        opacity: '1',
        transform: 'translate3d(0, 0, 0) rotate(0deg)',
        transformOrigin: 'right center',
      },
    },
  },
  'slide-in-rotate-right': {
    '@keyframes jumi-slide-in-rotate-right': {
      '0%': {
        opacity: '0',
        transform: 'translate3d(100%, 0, 0) rotate(15deg)',
        transformOrigin: 'left center',
        visibility: 'visible',
      },
      '100%': {
        opacity: '1',
        transform: 'translate3d(0, 0, 0) rotate(0deg)',
        transformOrigin: 'left center',
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

  'slide-in-up-scale': {
    '@keyframes jumi-slide-in-up-scale': {
      '0%': {
        opacity: '0',
        transform: 'translate3d(0, 100%, 0) scale(0.8)',
        visibility: 'visible',
      },
      '60%': {
        opacity: '1',
        transform: 'translate3d(0, 20%, 0) scale(1.05)',
      },
      '100%': {
        opacity: '1',
        transform: 'translate3d(0, 0, 0) scale(1)',
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
  'slide-reveal-down': {
    '@keyframes jumi-slide-reveal-down': {
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
  'slide-reveal-left': {
    '@keyframes jumi-slide-reveal-left': {
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
  'slide-reveal-right': {
    '@keyframes jumi-slide-reveal-right': {
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

  'slide-reveal-up': {
    '@keyframes jumi-slide-reveal-up': {
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
}

const zoomEffect = {

  'zoom-hover-grow': {
    '@keyframes jumi-zoom-hover-grow': {
      '0%': {
        transform: 'scale3d(1, 1, 1)',
      },
      '100%': {
        transform: 'scale3d(1.05, 1.05, 1.05)',
      },
    },
  },
  'zoom-hover-shrink': {
    '@keyframes jumi-zoom-hover-shrink': {
      '0%': {
        transform: 'scale3d(1, 1, 1)',
      },
      '100%': {
        transform: 'scale3d(0.95, 0.95, 0.95)',
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

  'zoom-in-3d': {
    '@keyframes jumi-zoom-in-3d': {
      '0%': {
        opacity: '0',
        transform: 'perspective(1000px) scale3d(0.3, 0.3, 0.3) rotateX(30deg)',
      },
      '50%': {
        opacity: '1',
        transform: 'perspective(1000px) scale3d(1.1, 1.1, 1.1) rotateX(15deg)',
      },
      '100%': {
        opacity: '1',
        transform: 'perspective(1000px) scale3d(1, 1, 1) rotateX(0deg)',
      },
    },
  },
  'zoom-in-blur': {
    '@keyframes jumi-zoom-in-blur': {
      '0%': {
        filter: 'blur(20px)',
        opacity: '0',
        transform: 'scale3d(1.3, 1.3, 1.3)',
      },
      '100%': {
        filter: 'blur(0px)',
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
  'zoom-in-down-left': {
    '@keyframes jumi-zoom-in-down-left': {
      '0%': {
        opacity: '0',
        transform: 'scale3d(0.3, 0.3, 0.3) translate3d(-100%, -100%, 0)',
      },
      '50%': {
        opacity: '1',
        transform: 'scale3d(1.08, 1.08, 1.08) translate3d(-15%, -15%, 0)',
      },
      '100%': {
        opacity: '1',
        transform: 'scale3d(1, 1, 1) translate3d(0, 0, 0)',
      },
    },
  },
  'zoom-in-down-right': {
    '@keyframes jumi-zoom-in-down-right': {
      '0%': {
        opacity: '0',
        transform: 'scale3d(0.3, 0.3, 0.3) translate3d(100%, -100%, 0)',
      },
      '50%': {
        opacity: '1',
        transform: 'scale3d(1.08, 1.08, 1.08) translate3d(15%, -15%, 0)',
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
  'zoom-in-rotate': {
    '@keyframes jumi-zoom-in-rotate': {
      '0%': {
        opacity: '0',
        transform: 'scale3d(0.3, 0.3, 0.3) rotate(-180deg)',
        transformOrigin: 'center center',
      },
      '50%': {
        opacity: '1',
        transform: 'scale3d(1.1, 1.1, 1.1) rotate(-90deg)',
        transformOrigin: 'center center',
      },
      '100%': {
        opacity: '1',
        transform: 'scale3d(1, 1, 1) rotate(0deg)',
        transformOrigin: 'center center',
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
  'zoom-in-up-left': {
    '@keyframes jumi-zoom-in-up-left': {
      '0%': {
        opacity: '0',
        transform: 'scale3d(0.3, 0.3, 0.3) translate3d(-100%, 100%, 0)',
      },
      '50%': {
        opacity: '1',
        transform: 'scale3d(1.08, 1.08, 1.08) translate3d(-15%, 15%, 0)',
      },
      '100%': {
        opacity: '1',
        transform: 'scale3d(1, 1, 1) translate3d(0, 0, 0)',
      },
    },
  },
  'zoom-in-up-right': {
    '@keyframes jumi-zoom-in-up-right': {
      '0%': {
        opacity: '0',
        transform: 'scale3d(0.3, 0.3, 0.3) translate3d(100%, 100%, 0)',
      },
      '50%': {
        opacity: '1',
        transform: 'scale3d(1.08, 1.08, 1.08) translate3d(15%, 15%, 0)',
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
  'zoom-out-3d': {
    '@keyframes jumi-zoom-out-3d': {
      '0%': {
        opacity: '1',
        transform: 'perspective(1000px) scale3d(1, 1, 1) rotateX(0deg)',
      },
      '50%': {
        opacity: '1',
        transform: 'perspective(1000px) scale3d(0.9, 0.9, 0.9) rotateX(-15deg)',
      },
      '100%': {
        opacity: '0',
        transform: 'perspective(1000px) scale3d(0.2, 0.2, 0.2) rotateX(-30deg)',
      },
    },
  },
  'zoom-out-blur': {
    '@keyframes jumi-zoom-out-blur': {
      '0%': {
        filter: 'blur(0px)',
        opacity: '1',
        transform: 'scale3d(1, 1, 1)',
      },
      '100%': {
        filter: 'blur(20px)',
        opacity: '0',
        transform: 'scale3d(0.7, 0.7, 0.7)',
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
  'zoom-out-rotate': {
    '@keyframes jumi-zoom-out-rotate': {
      '0%': {
        opacity: '1',
        transform: 'scale3d(1, 1, 1) rotate(0deg)',
        transformOrigin: 'center center',
      },
      '50%': {
        opacity: '1',
        transform: 'scale3d(0.9, 0.9, 0.9) rotate(90deg)',
        transformOrigin: 'center center',
      },
      '100%': {
        opacity: '0',
        transform: 'scale3d(0.2, 0.2, 0.2) rotate(180deg)',
        transformOrigin: 'center center',
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
  'wobbling': {
    '@keyframes jumi-wobbling': {
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
  'glowing': {
    '@keyframes jumi-glowing': {
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
  'rainbow': {
    '@keyframes jumi-rainbow': {
      '0%': {
        filter: 'hue-rotate(0deg) saturate(100%)',
      },
      '16%': {
        filter: 'hue-rotate(60deg) saturate(120%)',
      },
      '32%': {
        filter: 'hue-rotate(120deg) saturate(120%)',
      },
      '48%': {
        filter: 'hue-rotate(180deg) saturate(120%)',
      },
      '64%': {
        filter: 'hue-rotate(240deg) saturate(120%)',
      },
      '80%': {
        filter: 'hue-rotate(300deg) saturate(120%)',
      },
      '100%': {
        filter: 'hue-rotate(360deg) saturate(100%)',
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
