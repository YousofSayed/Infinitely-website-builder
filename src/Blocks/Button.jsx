import { Icons } from '../components/Icons/Icons'
import { reactToStringMarkup } from '../helpers/reactToStringMarkup'

/**
 * 
 * @param {{editor:import('grapesjs').Editor}} param0 
 */
export const Button = ({editor}) => {
  
 editor.Components.addType('button',{
    extend:'text',
    model:{
        defaults:{
            icon:reactToStringMarkup(Icons.button({fill:'white'})),
            tagName:'button',
            components:`Click Me`,
            attributes:{
                class:'p-10'
            },
            droppable:false,
            editable:true,
        }
    }
 })
}
