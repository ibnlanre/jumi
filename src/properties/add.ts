import { animate } from '@/helpers/animate'
import { assemble } from '@/helpers/assemble'
import { css } from '@/helpers/css'
import { merge } from '@/helpers/merge'

const animation = { animation: css('var', '--jumi-animation') }
export const addProperties = animate(merge(animation, assemble('animation')))
