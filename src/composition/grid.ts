import { css } from '@/helpers/css'
import { join } from '@/helpers/join'

const gridAutoRows = css('var', '--jumi-grid-auto-rows')
const gridTemplateRows = css('var', '--jumi-grid-template-rows', gridAutoRows)
const gridAutoFlow = css('var', '--jumi-grid-auto-flow')
const gridTemplateColumns = css('var', '--jumi-grid-template-columns')
const gridAutoColumns = css('var', '--jumi-grid-auto-columns', gridTemplateColumns)
const gridFlow = join([gridAutoFlow, gridAutoColumns], ' ')

export const grid = css('var', '--jumi-grid-template', join([gridTemplateRows, gridFlow], ' / '))
