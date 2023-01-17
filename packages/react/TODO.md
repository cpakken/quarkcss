- [ ] make variants required props (unless null prop or default :{} is passed)

compound variants OR []
```tsx
{
  compound: [
    {
      size: ['md', 'lg'],
      color:  'primary',
      rounded: null //TODO make sure this works
      outline: true, //TODO make sure this works
      value: 'md-primary'
    }
  ]
}


```


```tsx
type QuarkConfig: {
  //Set multiple variants at once
  themes: {
    highlight: {
      size: 'md',
      color: 'primary',
    }
  }
}


const App = () => {
  return (
    <Button theme='highlight'>Click me</Button>
  )
}
```


https://windstitch.vercel.app/docs/create-a-component
https://github.com/joe-bell/cva