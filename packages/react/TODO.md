
compound variants OR []
```tsx

createCompoundResolver(compoundConfig) => (variantProps) => string | null
const resolveCompound = createCompoundResolver(compoundConfig)

const compoundResolvers = compoundConfigs.map(createCompoundResolver)

const resolveCompounds = (props) : (string | null)[]=> {
  return compoundResolvers.map((resolver) => resolver(props))
}


//make add className function that takes in string | null and only pushes if not null
className.push(...resolveCompounds(props))

{
  compound: [
    {
      size: ['md', 'lg'], //OR
      
      '!type': 'button', //negation (if type is !== 'button')

      color:  'primary',
      rounded: null //TODO make sure this works
      outline: true, //TODO make sure this works

    //TODO change 'value' to 'apply
      apply: 'md-primary'
      // value: 'md-primary'
    }
  ]
}


```

**THEMES**

```tsx
type QuarkConfig: {
  //Set multiple variants at once
  themes: {
    highlight: {
      size: 'md',
      color: 'primary',
    }
  }

  defaults: {
    theme: 'highlight' //Set in DEFAULT
  }
}


const App = () => {
  return (
    <Button theme='highlight'>Click me</Button>
  )
}
```

## Apparently, many people have the same idea as me

https://windstitch.vercel.app/docs/create-a-component
https://github.com/joe-bell/cva
https://github.com/sannajammeh/tw-classed

- differences, they don't have boolean keys (true, null) from the original stitches api
- default component props