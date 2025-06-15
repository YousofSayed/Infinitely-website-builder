import { Icons } from '../components/Icons/Icons'
import { reactToStringMarkup } from '../helpers/reactToStringMarkup'

/**
 * 
 * @param {{editor:import('grapesjs').Editor}} param0 
 */
export const Text = ({editor}) => {
  editor.Components.addType('text',{
    extend:'text',
    model:{
        defaults:{
            icon:reactToStringMarkup(Icons.text({fill:'white'})),
            droppable:false,
            tagName:'p',
            components:`Insert your text here`,
            attributes:{
                class:'p-10'
            }
        }
    }
  })
}
