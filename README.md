# Semantic Reasoner
Checks if statements are true, false, or not enough information to say.
## Documentation
Code comments `# Message`<br>
If then `if ... then ...`<br>
Not `not ...`<br>
And / Or / Xor `... and ...`<br>
Variables `xyzwqrstuv`<br>
## Examples
See how `not` goes before `x is lame` which is now a premise that can be used.
```lua
if x is cool then not x is lame
```
You can invoke `is lame` with any variable you like and it will act the same.
```lua
y is cool and not y is lame
```
If you spell the premise differently it will not mean the same thing. For example, `x is tallest` and `x is the tallest`. These will be treated as completely different statements about `x`.
## Final Notes
It can be easy to forget about things you may think are true in your head, but not explicitly stated in code. Make sure you identify all key relationships.<br>
### Bad Example
```lua
if x is living then x is a plant or x is an animal
if x is living and not x is a plant then not x is an animal
```
### Good Example
```lua
# Dont forget to state mutual exclusion!
if x is a plant then not x is an animal
if x is an animal then not x is a plant
if x is living then x is a plant or x is an animal
if x is living and not x is a plant then not x is an animal
```
You can chain `xor` to do something similar.
```
x is a plant xor x is an animal xor x is an alien
```