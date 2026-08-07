import { interactionId, interactionInstanceId, mainInteractionId, mainMotionId, motionId, motionInstanceId } from '@/constants/shared';
import { isArray, isPlainObject } from 'lodash';

/**
 *
 * @param {{inf_meta : any , key:string , motions : Record<string,import('@/helpers/types').MotionType>}} param0
 * @returns
 */
export const loopOnInfMetaMotionsData = ({ inf_meta, key, motions }) => {
  if (!inf_meta?.[key]) {
    console.warn(`${key} is not exist`);
    return;
  }

  const data = inf_meta[key];
  const html = data.html;
  if (!html) {
    console.warn(`html components in ${key} is not exist`);
    return;
  }

  if (isArray(html)) {
    const loop = (html) => {
      for (const cmp of html) {
        const attributes = cmp["attributes"];
        if (!isPlainObject(attributes)) {
          console.warn(attributes, "attributes is not plain object");
          continue;
        }

        const motion_Id = attributes[motionId];
        if (motion_Id && isPlainObject(motions[motion_Id])) {
          motions[motion_Id].used = true;
        }

        // else {
        //   motions[motion_Id].used = false;
        // }

        const main_motion_id = attributes[mainMotionId],
          instance_id = attributes[motionInstanceId];
        if (
          main_motion_id &&
          instance_id &&
          isPlainObject(motions[main_motion_id]) &&
          isPlainObject(motions[main_motion_id]?.instances) &&
          isPlainObject(motions[main_motion_id].instances[instance_id])
        ) {
          motions[main_motion_id].instances[instance_id].used = true;
        }

        // else {
        //   motions[main_motion_id].instances[instance_id].used = false;
        // }

        if (isArray(cmp.components)) {
          loop(cmp.components);
        }
      }
    };

    loop(html);
  }

  return motions;
};

/**
 *
 * @param {{inf_meta : any , key:string , interactions : import('@/helpers/types').InteractionsInDB}} param0
 * @returns
 */
export const loopOnInfMetaInteractionsData = ({ inf_meta, key, interactions }) => {
  if (!inf_meta?.[key]) {
    console.warn(`${key} is not exist`);
    return;
  }

  const data = inf_meta[key];
  const html = data.html;
  if (!html) {
    console.warn(`html components in ${key} is not exist`);
    return;
  }

  if (isArray(html)) {
    const loop = (html) => {
      // for (const [id,interaction] of Object.entries(interactions)) {
        
        for (const cmp of html) {
          const attributes = cmp["attributes"];
          if (!isPlainObject(attributes)) {
            console.warn(attributes, "attributes is not plain object");
            continue;
          }
  
          const interaction_Id = attributes[interactionId];
          // console.log('interaction_Id' , interaction_Id , interactions , interactions[interaction_Id],isArray(interactions[interaction_Id]));
          
          if (interaction_Id && isArray(interactions[interaction_Id])) {
            for (const interaction of interactions[interaction_Id]) {
              interaction.used = true;
            };
          }
  
          // else {
          //   motions[motion_Id].used = false;
          // }
  
          const main_interaction_id = attributes[mainInteractionId],
            instance_id = attributes[interactionInstanceId];
          if (
            main_interaction_id &&
            instance_id &&
            isArray(interactions[main_interaction_id]) 
          ) {
            for (const interaction of interactions[main_interaction_id]) {
              const instances = interaction?.instances;
              if(!isPlainObject(instances))continue;
              const instance = instances[instance_id];
              if(!isPlainObject(instance))continue;
              instance.used = true;
            };
          }
  
         
  
          if (isArray(cmp.components)) {
            loop(cmp.components);
          }
        }
      // }
    };

    loop(html);
  }
  console.log('interactions : ', interactions);
  
  return interactions;
};
