import { css } from '@/helpers/css'
import { join } from '@/helpers/join'

const gridTemplateRows = css('var', '--jumi-grid-template-rows')
const gridTemplateColumns = css('var', '--jumi-grid-template-columns')
const gridTemplateLayout = join([gridTemplateRows, gridTemplateColumns], ' / ')
const gridTemplateAreas = css('var', '--jumi-grid-template-areas')

export const gridTemplate = join([gridTemplateAreas, gridTemplateLayout], ' ')
