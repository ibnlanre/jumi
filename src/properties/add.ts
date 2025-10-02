import { animate } from '@/helpers/animate'
import { css } from '@/helpers/css'
import { join } from '@/helpers/join'
import { keyframeVariables } from '@/keyframes/property'

export const addProperties = animate({
  '--jumi-animation': join([
    css('var', '--jumi-effect-keyframes', 'none'),
    keyframeVariables,
  ], ', '),
})
