import { Property } from './Property'

export const GridPropsChilds = () => {
  return (
    <section className=' flex flex-col gap-2'>
        <Property cssProp='grid-row' label='Grid Row' />
        <Property cssProp='grid-column' label='Grid Column' />
    </section>
  )
}
