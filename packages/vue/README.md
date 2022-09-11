# Free Transfrom + Vue
 

```js
import {FreeTransform} from "@free-transform/vue"

```

 ```html
<FreeTransform           
    :x="0"
    :y="0"
    :width="100"
    :height="100"
    :offset="[0,0]"
    :matrix=""
    :warp=""
    @update
>
           
    <Grid
        stroke="#000000"
        :lines="2"
        :stroke-width="1"
    />

    <Handle
        :position="[0,0]"
        :origin="[.5, .5]"
        class="rotator"
        type="rotate"        
    />

    <Handle
        :position="[0,0]"
        class="handle"
        type="scale"
    />

    <Handle
        :position="[0,0]"
        class="handle"
        type="scwarpale"
    />
</FreeTransform>
 ```





```js
import {Transformed} from "@free-transform/vue"

```

 ```html
<Transformed           
    :x="0"
    :y="0"
    :width="100"
    :height="100"
    :offset="[0,0]"
    :matrix=""
    :warp="" 
>
           
   <img src='///' />
</Transformed>
 ```

