import { html, uniqueID } from "../helpers/cocktail";
import {
  getAllCssProperties,
  getAllStandardCSSProperties,
  getArrayProps,
  getWindowBuiltInClasses,
} from "../helpers/functions";
import {
  conversions,
  defaultAttributeNames,
  eventNames,
  eventsModifiers,
  fetchConversions,
  hsZoo,
  httpGetterMethods,
  httpSetterMethods,
  measure,
  operators,
  putPositions,
} from "./hsValues";

/**
 * @type {{[key:string] : import('../helpers/types').CMD}}
 */
export const hsCmds = {
  set_var: {
    cmd: `set {option}{name} to {value}`,
    options: {
      global: "$",
      local: ":",
    },
    optionsRequired: true,
    params: [
      { name: "name", type: "text", role: "varName", required: true },
      {
        name: "value",
        type: "select",
        isCode: true,
        keywords: [...hsZoo],
        role: "varValue",
        required: true,
        value: "",
        handler: true,
        custom: [
          {
            name: "object",
            type: "object",
          },
          {
            name: "array",
            type: "array",
          },
        ],
      },
    ],
    symbol: ":",
  },

  set_object_var: {
    cmd: `set {option}{name} to {value}`,
    desc: `make variable with multi data in single one variable`,
    options: {
      global: "$",
      local: ":",
    },
    optionsRequired: true,
    params: [
      {
        name: "name",
        type: "text",
        role: "varName",
        handler: true,
        required: true,
      },
      { name: "value", type: "object", role: "varValue", required: true },
    ],
  },

  set_array_var: {
    cmd: `set {option}{name} to [{value}]`,
    desc: `make variable with multi data in single one variable`,
    options: {
      global: "$",
      local: ":",
    },
    optionsRequired: true,
    params: [
      {
        name: "name",
        type: "text",
        role: "varName",
        handler: true,
        required: true,
      },
      { name: "value", type: "array", role: "varValue", required: true },
    ],
  },

  make: {
    cmd: `make {Class} from {params} called {variable_name}`,
    desc: html`
      <article>
        <h1>If you want to make new objects, you can use the make :</h1>
        <p>
          make a URL from "/path/", "https://origin.example.com" Which is equal
          to the JavaScript
          <code>new URL("/path/", "https://origin.example.com")</code>
        </p>
      </article>

      <article>
        <h1>
          If you wish to assign an identifier to the new object you can use the
          called modifier:
        </h1>
        <p>
          make a URL from "/path/", "https://origin.example.com" called myURL
          log myURL
        </p>
      </article>
    `,
    params: [
      {
        name: "Class",
        required: true,
        type: "select",
        role: "classValue",
        keywords: getWindowBuiltInClasses(),
      },
      {
        name: "params",
        accessAll: true,
        required: true,
        type: "array",
      },
      {
        name: "variable_name",
        required: true,
        role: "className",
        value: "",
        handler: true,
        type: "text",
      },
    ],
  },

  on: {
    cmd: `on {event} {modifier}`,
    starter: true,
    shouldHaveEnder: true,
    desc: `event handlers allow you to respond to any event (not just DOM events, as with onClick handlers) and provide a slew of features for making working with events easier.`,
    params: [
      {
        name: "event",
        desc: `event name`,
        type: "select",
        keywords: eventNames,
        required: true,
      },
      {
        name: "modifier",
        desc: html`
          <article>
            <h1>The Every Modifier</h1>

            <p>
              An event handler with the every modifier will execute the event
              handler for every event that is received, even if the preceding
              handler execution has not finished. This is useful in cases where
              you want to make sure you get the handler logic for every event
              going immediately.
            </p>
          </article>

          <article>
            <h1>The Queue Modifier</h1>

            <p>
              The every keyword is a prefix to the event name, but for other
              queuing options, you postfix the event name with the queue
              keyword. You may pick from one of four strategies: -none - Any
              events that arrive while the event handler is active will be
              dropped -all - All events that arrive will be added to a queue and
              handled in order -first - The first event that arrives will be
              queued, all others will be dropped -last - The last event that
              arrives will be queued, all others will be dropped
            </p>
          </article>
        `,
        type: "select",
        keywords: eventsModifiers,
      },
    ],
  },

  on_with_data: {
    cmd: `on {event}({params}) {modifier}`,
    starter: true,
    shouldHaveEnder: true,
    desc: `event handlers allow you to respond to any event with data.`,
    params: [
      {
        name: "event",
        desc: `event name`,
        type: "select",
        keywords: eventNames,
        required: true,
      },
      {
        name: "modifier",
        desc: html`
          <article>
            <h1>The Every Modifier</h1>

            <p>
              An event handler with the every modifier will execute the event
              handler for every event that is received, even if the preceding
              handler execution has not finished. This is useful in cases where
              you want to make sure you get the handler logic for every event
              going immediately.
            </p>
          </article>

          <article>
            <h1>The Queue Modifier</h1>

            <p>
              The every keyword is a prefix to the event name, but for other
              queuing options, you postfix the event name with the queue
              keyword. You may pick from one of four strategies: -none - Any
              events that arrive while the event handler is active will be
              dropped -all - All events that arrive will be added to a queue and
              handled in order -first - The first event that arrives will be
              queued, all others will be dropped -last - The last event that
              arrives will be queued, all others will be dropped
            </p>
          </article>
        `,
        type: "select",
        keywords: eventsModifiers,
      },
      {
        name: "params",
        type: "array",
        // accessParams:true,
        required: true,
      },
    ],
  },

  on_from: {
    cmd: `on {event} from {from}`,
    desc: `respond event from another target (not just DOM events)`,
    starter: true,
    shouldHaveEnder: true,
    ex: html`
      <h1>on storage from window</h1>
      Or
      <h1>on click from #another_element</h1>
    `,
    params: [
      {
        name: "event",
        type: "select",
        accessEvents: true,
        keywords: eventNames,
        required: true,
      },
      {
        name: "from",
        type: "select",
        keywords: hsZoo,
        accessVars: true,

        required: true,
      },
    ],
  },

  on_from_with_data: {
    cmd: `on {event}(params) from {from}`,
    desc: `respond event from another target (not just DOM events)`,
    starter: true,
    shouldHaveEnder: true,
    ex: html`
      <h1>on storage from window</h1>
      Or
      <h1>on click from #another_element</h1>
    `,
    params: [
      {
        name: "event",
        type: "select",
        accessEvents: true,
        keywords: eventNames,
        required: true,
      },
      {
        name: "params",
        accessParams: true,
        required: true,
        type: "array",
      },
      {
        name: "from",
        type: "select",
        keywords: hsZoo,
        accessVars: true,
        required: true,
      },
    ],
  },

  halt_event: {
    cmd: `halt the event`,
    baseline: true,
    desc: html`
      <p>
        It is prevent default behavior in browser as : event.preventDefault() in
        javascript
      </p>
    `,
    params: [],
  },

  // stop_Propagation:{
  //   cmd : `event.stopPropagation()`,
  //   l(){
  //     document.body.addEventListener('click',ev=>{ev.stopPropagation})
  //   }
  // },

  // send_event: {
  //   cmd: `send {event_name} `,
  //   desc: html` <h1>send global events to onther elements</h1> `,
  //   starter: true,
  //   params: [{ name: "event_name", type: "text", required: true }],
  // },

  send_event_to_target: {
    cmd: `send {event_name} to {selector}`,
    desc: html` <h1>send events to other elements</h1> `,
    starter: true,
    shouldHaveEnder: true,
    params: [
      { name: "event_name", role: "eventName", type: "text", required: true },
      {
        name: "selector",
        type: "select",
        keywords: hsZoo,
        accessCssClasses: true,
        accessVars: true,
        required: true,
      },
    ],
  },

  send_event_to_target_with_params: {
    cmd: `send {event_name}({params}) to {selector} `,
    desc: html`
      <h1>send events to other elements with params (key & value)</h1>
    `,
    starter: true,
    params: [
      { name: "event_name", role: "eventName", type: "text", required: true },
      {
        name: "selector",
        type: "select",
        keywords: hsZoo,
        accessCssClasses: true,
        accessVars: true,
        required: true,
      },
      {
        name: "params",
        type: "object",
        role: "params",
        removeCurlyBrackets: true,
        required: true,
      },
    ],
  },

  on_muatation: {
    cmd: `on mutation of {selector}`,
    starter: true,
    shouldHaveEnder: true,
    desc: html`
      <p>
        You can listen for mutations on current element with the on mutation
        form. This will use the Mutation Observer API, but will act more like a
        regular event handler.
      </p>
    `,
    ex: html`
      <ul>
        <li>-on mutation of @class</li>
        <li>-on mutation of anything</li>
      </ul>
    `,
    params: [
      {
        name: "selector",
        type: "select",
        accessVars: true,
        keywords: ["anything"],
        required: true,
      },
    ],
  },

  on_intersection: {
    cmd: `on intersection(intersecting) having threshold {threshold}`,
    desc: `Another synthetic event is the intersection event that uses the Intersection Observer API.`,
    starter: true,
    shouldHaveEnder: true,
    ex: html`
      <p>
        on intersection(intersecting) having threshold 0.5 if intersecting
        transition opacity to 1 else transition opacity to 0
      </p>
    `,
    params: [{ name: "threshold", type: "number", required: true }],
  },

  transition: {
    cmd: `transition {css_property} to {value}`,
    desc: `It is set transition effect when set css property `,
    params: [
      {
        name: "css_property",
        type: "select",
        keywords: getAllCssProperties(),
        required: true,
      },
      {
        name: "value",
        type: "select",
        isCode: true,
        required: true,
      },
    ],
  },

  settle: {
    cmd: `settle `,
    desc: html`
      <p>
        If you wish to wait until a transition completes after adding a new
        class, you should use the <strong>settle</strong> command which will let
        any transitions that are triggered by adding or removing a class finish
        before continuing.
      </p>
    `,
    baseline: true,
    color: "",
    params: [],
  },

  wait: {
    cmd: `wait {time}s`,
    desc: `It wait and do the next command when it finnish , (the time is by seconds!) `,
    params: [
      { name: "time", type: "select", accessVars: true, required: true },
    ],
  },

  increment: {
    cmd: `increment {value}`,
    desc: `increment value`,
    params: [
      {
        name: "value",
        accessAll: true,
        type: "select",
        isCode: true,
        required: true,
      },
    ],
  },

  decrement: {
    cmd: `decrement {value}`,
    desc: `decrement value`,
    params: [
      {
        name: "value",
        accessAll: true,
        type: "select",
        isCode: true,
        required: true,
      },
    ],
  },

  // get: {
  //   cmd: `get {variable}`,
  //   params: [
  //     {
  //       name: "variable",
  //       type: "select",
  //       accessAll: true,
  //       required: true,
  //       keywords: hsZoo,
  //     },
  //   ],
  // },

  log: {
    cmd: "log {value}",
    params: [
      {
        name: "value",
        type: "select",
        accessRestVars:true,
        isCode: true,
        accessAll: true,
        keywords: hsZoo,
        required: true,
      },
    ],
  },

  toggle: {
    cmd: `toggle {class_name} `,
    desc: `toggle class on current element , class name can be an variable too`,
    ex: `toggle .class`,
    params: [
      {
        name: "class_name",
        type: "select",
        accessCssClasses: true,
        required: true,
      },
    ],
  },

  toggle_on: {
    cmd: `toggle {class_name} on {selector}`,
    desc: `toggle class on another element`,
    ex: `toggle class on .main`,
    params: [
      {
        name: "class_name",
        type: "select",
        keywords: [],
        accessAll: true,
        accessCssClasses: true,
        required: true,
      },
      {
        name: "selector",
        type: "select",
        keywords: [],
        accessAll: true,
        accessCssClasses: true,
        required: true,
      },
    ],
  },

  closures: {
    cmd: `{variable}.{closure}(\\ {params} -> {return} )`,
    params: [
      {
        name: "variable",
        accessAll: true,
        type: "select",
        required: true,
      },
      {
        required: true,
        name: "closure",
        type: "select",
        keywords: getArrayProps(),
      },
      {
        required: true,
        name: "params",
        type: "array",
        length: 2,
      },
      {
        required: true,
        name: "return",
        type: "code",
        lang: "javascript",
      },
    ],
  },

  condition_if: {
    cmd: `if {target-1} {operator} {target-2}`,
    starter: true,
    shouldHaveEnder: true,
    params: [
      {
        name: "target-1",
        type: "select",
        keywords: hsZoo,
        required: true,
        accessAll: true,
      },
      { name: "operator", type: "select", keywords: operators, required: true },
      {
        name: "target-2",
        type: "select",
        keywords: hsZoo,
        required: true,
        accessAll: true,
      },
    ],
  },

  condition_else: {
    cmd: ` else `,
    shouldHaveEnder: true,
    baseline: true,
    desc: `else keyword statement `,
    params: [],
  },

  repeat_until: {
    cmd: `repeat until {target-1} {operator} {target-2}`,
    shouldHaveEnder: true,
    params: [
      {
        name: "target-1",
        type: "select",
        keywords: hsZoo,
        required: true,
        accessAll: true,
      },
      { name: "operator", type: "select", keywords: operators, required: true },
      {
        name: "target-2",
        type: "select",
        keywords: hsZoo,
        required: true,
        accessAll: true,
      },
    ],
  },

  repeat_times: {
    cmd: `repeat {times} times`,
    shouldHaveEnder: true,
    params: [
      {
        name: "times",
        type: "select",
        keywords: [],
        accessAll: true,
        required: true,
      },
    ],
  },

  repeat_while: {
    cmd: `repeat while {target-1} {operator} {target-2}`,
    shouldHaveEnder: true,
    params: [
      {
        name: "target-1",
        type: "select",
        keywords: hsZoo,
        required: true,
        accessAll: true,
      },
      { name: "operator", type: "select", keywords: operators, required: true },
      {
        name: "target-2",
        type: "select",
        keywords: hsZoo,
        required: true,
        accessAll: true,
      },
    ],
  },

  repeat_forever: {
    cmd: `repeat forever`,
    starter: true,
    shouldHaveEnder: true,
    params: [],
  },

  for: {
    cmd: `repeat {array}.length times set {index} to it`,
    desc: `for loop by index`,
    ex: html`
      for (let index = 0; index < array.length; index++) { const element =
      array[index]; }
    `,
    starter: true,
    params: [
      {
        name: "array",
        type: "select",
        isCode: true,
        accessRestVars: true,
        // isTemplateEngine:true,
        accessAll: true,
        required: true,
      },
      {
        name: "index",
        type: "text",
        required: true,
      },
    ],
  },

  for_loop: {
    cmd: `for \{var_name} in {array} index {index}`,
    starter: true,
    params: [
      { name: "var_name", type: "text", role: "forVarName", required: true },
      {
        name: "array",
        type: "select",
        accessAll: true,
        role: "varValue",
        required: true,
      },
      { name: "index", type: "text", role: "forVarIndex", required: true },
    ],
  },

  add_selector: {
    cmd: `add {class_name} to {target}`,
    desc: `if you want to add the class .foo to all elements that have the class .bar on it, you can simply write this: add .foo to .bar`,
    params: [
      { name: "selector-1", type: "text" },
      {
        name: "target",
        type: "select",
        accessAll: true,
        accessCssClasses: true,
        keywords: hsZoo,
      },
    ],
  },

  remove_element: {
    cmd: `remove {target}`,
    desc: html`
      <h1>
        you can also use the remove command to remove content from the DOM
      </h1>
      <p>
        The remove command is smart enough to figure out what you want to happen
        based on what you tell it to remove.
      </p>
    `,
    params: [
      {
        name: "target",
        type: "select",
        keywords: hsZoo,
        accessCssClasses: true,
        required: true,
        accessAll: true,
      },
    ],
  },

  show_or_hide: {
    cmd: `{command} {target}`,
    desc: html`
      <h1>You can show and hide things with the show and hide commands:</h1>
    `,
    params: [
      {
        name: "command",
        type: "select",
        keywords: ["show", "hide"],
        required: true,
      },
      {
        name: "target",
        type: "select",
        keywords: hsZoo,
        accessAll: true,
        accessCssClasses: true,
        required: true,
      },
    ],
  },

  show_or_hide_with_custom_property: {
    cmd: `{command} {target} with *{property}`,
    desc: html`
      <h1>
        By default, the show and hide commands will use the display style
        property. You can instead use visibility or opacity with the following
        syntax
      </h1>
    `,
    params: [
      {
        name: "command",
        type: "select",
        keywords: ["show", "hide"],
        required: true,
      },
      {
        name: "target",
        type: "select",
        keywords: hsZoo,
        required: true,
        accessAll: true,
        accessCssClasses: true,
      },
      {
        name: "property",
        type: "select",
        keywords: getAllCssProperties(),
        required: true,
      },
    ],
  },

  remove_from: {
    cmd: `remove  {class_name} from {target}`,
    desc: `if you want to remove the class .foo to all elements that have the class .bar on it, you can simply write this: add .foo to .bar`,
    params: [
      { name: "selector-1", type: "text", required: true },
      {
        name: "target",
        type: "select",
        keywords: hsZoo,
        accessAll: true,
        accessCssClasses: true,
        required: true,
      },
    ],
  },

  append_to: {
    cmd: `append {value} to {target}`,
    desc: `The append command can append content to strings (as well as to arrays and the DOM)`,
    params: [
      {
        name: "value",
        type: "select",
        isCode: true,
        accessRestVars: true,
        keywords: [],
        accessAll: true,
        required: true,
      },
      {
        name: "target",
        type: "select",
        keywords: hsZoo,
        required: true,
        accessAll: true,
        accessCssClasses: true,
      },
    ],
  },

  // append_Content_to : {
  //   cmd: `append {value} to {target}`,
  //   params: [
  //     {
  //       name: "value",
  //       type: "select",
  //       keywords: [],
  //       accessAll: true,
  //       required: true,
  //     },
  //     {
  //       name: "target",
  //       type: "select",
  //       keywords: hsZoo,
  //       required: true,
  //       accessAll: true,
  //       accessCssClasses:true,
  //     },
  //   ],
  // },

  convert_to: {
    cmd: `{variable} as {type}`,
    desc: `To convert values between different types `,
    params: [
      {
        name: "variable",
        type: "select",
        keywords: hsZoo,
        accessAll: true,
        required: true,
      },
      { name: "type", type: "select", keywords: conversions, required: true },
    ],
  },

  to_fixed_number: {
    cmd: `{variable} as Fixed<:{N}>`,
    desc: `convert to a fixed precision string representation of the number, with an optional precision of N`,
    params: [
      {
        name: "variable",
        type: "select",
        keywords: hsZoo,
        required: true,
        accessAll: true,
      },
      { name: "N", type: "number", required: true },
    ],
  },

  get_random_number: {
    cmd: `set \${var_name} to Math.random() `,
    desc: `get random number`,
    params: [
      {
        name: "var_name",
        role: "varName",
        type: "text",
        required: true,
        handler: true,
      },
    ],
  },

  get_random_in_array: {
    cmd: `set \${var_name} to {array}[Math.floor(Math.random())] `,
    desc: `get random number in array as global variable`,
    params: [
      {
        name: "var_name",
        role: "varName",
        value: "",
        type: "text",
        handler: true,
        required: true,
      },
      {
        name: "array",
        type: "select",
        keywords: hsZoo,
        accessAll: true,
        required: true,
      },
    ],
  },

  throwing_exception: {
    cmd: `throw {exception}`,
    desc: `You may throw an exception using the familiar throw keyword:`,
    params: [{ name: "exception", type: "text", required: true }],
  },

  put_html_in_element: {
    cmd: `put \`\${content}\` {position} {element}`,
    desc: html`
      <article>
        <h1>put {content} before {element}</h1>
        <p>Puts the content in front of the element, using Element.before.</p>
      </article>

      <article>
        <h1>put {content} at the start of {element}</h1>
        <p>
          Puts the content at the beginning of the element, using
          Element.prepend.
        </p>
      </article>

      <article>
        <h1>put {content} at the end of {element}</h1>
        <p>Puts the content at the end of the element, using Element.append.</p>
      </article>

      <article>
        <h1>put content after element</h1>
        <p>Puts the content after the element, using Element.after.</p>
      </article>
    `,
    params: [
      { name: "content", type: "code", lang: "html", required: true },
      {
        name: "position",
        type: "select",
        keywords: putPositions,
        required: true,
      },
      {
        name: "element",
        type: "select",
        keywords: hsZoo,
        accessAll: true,
        accessCssClasses: true,
        required: true,
      },
    ],
  },

  put_dynamic_template: {
    cmd: `put \`{template}\` {position} {element}`,
    params: [
      {
        name: "template",
        type: "select",
        renderDynamicElement: true,
        required: true,
      },
      {
        name: "position",
        type: "select",
        keywords: putPositions,
        required: true,
      },
      {
        name: "element",
        type: "select",
        accessAll: true,
        keywords: hsZoo,
        accessCssClasses: true,
        required: true,
      },
    ],
  },

  get_attribute_as_var: {
    cmd: `get @{attribute_name} then set \${var_name} to it`,
    desc: `get attribute for current element`,
    params: [
      {
        name: "attribute_name",
        type: "select",
        keywords: defaultAttributeNames,
        required: true,
      },
      {
        name: "var_name",
        role: "varName",
        handler: true,
        type: "text",
        keywords: defaultAttributeNames,
        required: true,
      },
    ],
  },

  set_attribute: {
    cmd: `set @{attribute_name} to {value}`,
    desc: `set attribute for current element`,
    params: [
      {
        name: "attribute_name",
        type: "select",
        keywords: defaultAttributeNames,
        accessVars: true,
        required: true,
      },
      {
        name: "value",
        type: "select",
        keywords: [],
        accessVars: true,
        required: true,
      },
    ],
  },

  measure: {
    cmd: `measure {target} {dimension}`,
    desc: html`
      <p>
        The measure command gets the measurements for a given element using
        getBoundingClientRect() as well as the scroll* properties. It will place
        the result into the result variable. You may also specify particular
        measurements to be saved into local variables, by name. The available
        measurements are:
      </p>

      <ul>
        <li>x</li>
        <li>y</li>
        <li>left</li>
        <li>top</li>
        <li>right</li>
        <li>bottom</li>
        <li>width</li>
        <li>height</li>
        <li>bounds</li>
        <li>scrollLeft</li>
        <li>scrollTop</li>
        <li>scrollLeftMax</li>
        <li>scrollTopMax</li>
        <li>scrollWidth</li>
        <li>scrollHeight</li>
        <li>scroll</li>
      </ul>
    `,
    ex: html`
      <code>on click measure me then log it</code>
      <code>on click measure my top then log top</code>
    `,
    params: [
      {
        name: "target",
        type: "select",
        keywords: hsZoo,
        accessAll: true,
        required: true,
      },
      {
        name: "dimension",
        type: "select",
        keywords: measure,
        accessAll: true,
        required: true,
      },
    ],
  },

  send_data: {
    cmd: `fetch {url} as {response_type} with {
        method: '{method}',
        headers: {headers},
        body : {body}
    } then set \${variable_name} to result`,
    desc: html` <h1>Fetch data and set it as global variable</h1> `,
    ex: html`
      <code>
        fetch 'https://jsonplaceholder.typicode.com/todos/' as JSON with {
        method: 'POST', headers: {'content-type' : 'application/json'} } then
        set $todos to result
      </code>
    `,
    id: uniqueID(),
    name: "send_data",
    params: [
      {
        name: "url",
        accessAll: true,
        type: "select",
        keywords: [],
        required: true,
      },
      {
        name: "response_type",
        type: "select",
        keywords: fetchConversions,
        required: true,
      },
      {
        name: "method",
        type: "select",
        keywords: httpSetterMethods,
        value: "",
        required: true,
      },
      { name: "headers", type: "object", value: "", required: true },
      { name: "body", type: "object", value: "", required: true },
      {
        name: "variable_name",
        type: "text",
        role: "varName",
        value: "",
        accessRestVars: true,
        handler: true,
        required: true,
      },
    ],
  },

  get_data: {
    cmd: `fetch {url} as {response_type} with {
      method: '{method}',
      headers: {headers}
  } then set \${variable_name} to result`,
    desc: html` <h1>Fetch data and set it as global variable</h1> `,
    ex: html`
      <code>
        fetch 'https://jsonplaceholder.typicode.com/todos/' as JSON with {
        method: 'POST', headers: {'content-type' : 'application/json'} } then
        set $todos to result
      </code>
    `,
    id: uniqueID(),
    name: "get_data",
    params: [
      {
        name: "url",
        accessAll: true,
        type: "select",
        keywords: [],
        required: true,
      },
      {
        name: "response_type",
        type: "select",
        keywords: fetchConversions,
        required: true,
      },
      {
        name: "method",
        type: "select",
        keywords: httpGetterMethods,
        value: "",
        required: true,
      },
      { name: "headers", type: "object", value: "", required: true },
      {
        name: "variable_name",
        type: "select",
        accessRestVars: true,
        role: "varName",
        value: "",
        handler: true,
        required: true,
      },
    ],
  },

  end: {
    cmd: ` end `,
    ender: true,
    desc: `end command is necessary when you use condtions of loops or you wanna to end event and start new`,
    params: [],
    color: "",
  },

  then: {
    cmd: ` then `,
    baseline: true,
    desc: `It is useful to make your commands readable and easy to understand`,
    color: "",
    params: [],
  },

  inline_js: {
    cmd: `js({params}) {js_code} end`,
    desc: `js block is a space to write javaScript functions and return it as block`,
    ex: html`
      js[(<param-list
        >)]
        <js-body>
          end param-list is a comma separated list of identifiers, which are
          _hyperscript variables whose values will be passed to this JavaScript
          code and become available there under their original name js-body is
          some JavaScript code whose return value will be the result of this
          command (what it refers to in the next command).
        </js-body></param-list
      >
    `,
    starter: true,
    params: [
      { name: "params", type: "array", accessAll: true },
      { name: "js_code", lang: "javascript", type: "code", required: true },
    ],
  },

  call_function: {
    cmd: `call {function_name}({params})`,
    desc: `call function by name and pass params`,
    ex: `call regexFind('(.*)\+.*@.*', 1, my.value)`,
    params: [
      {
        name: `function_name`,
        accessFunctions: true,
        required: true,
        type: "select",
      },
      {
        name: "params",
        type: "array",
        accessAll: true,
        // required: true,
      },
    ],
  },
};

// hsCmds.setGlobalVar.params[1].handler((name)=>name)
