- forwardProp example  
StyledCheckbox = styled.input({
  variants: {
    checked: {true: '...', false: '...'}, 
  },
  shouldForwardProp: ['checked']
}, { checked: false})

## Apparently, many people have the same idea as me

https://windstitch.vercel.app/docs/create-a-component
https://github.com/joe-bell/cva
https://github.com/sannajammeh/tw-classed

- differences, they don't have boolean keys (true, null) from the original stitches api
- default component props
