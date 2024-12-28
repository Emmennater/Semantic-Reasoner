# Semantic Reasoner
Checks if statements are true, false, or not enough information to say.
After you click execute some results will show up.
- Gray means there is <b>not enough information</b> to be proven.
- Red means the statement is <b>contradictory</b>.
- Green means the statement is <b> proven.</b>

Execute all will try to prove each statement one after another.
Execute last will assume everything before it and try to prove the final statement.
Reset will clear all text annotations.
## Documentation <a id="doc"></a>
Code comments `# Message`<br>
If then `if ... then ...`<br>
If and only if `... iff ... `<br>
Not `not ...`<br>
And / Or / Xor `... and ...`<br>
Variables `xyzwqrstuv`<br>
Parenthesis `if x then (if y then z)`
## Terms <a id="terms"></a>
- **Preposition** is a phrase that doesn't include any variables. Its value once defined, (true or false) will remain constant. Example: `sally is cool`
- **Linking Verb**: A verb that connects the subject of a sentence to a subject complement (such as a predicate adjective or predicate nominative). Example: `is` in "Sally **is** cool."
- **Subject**: The noun, noun phrase, or pronoun that performs the action of the verb or that the verb acts upon. Example: In "Sally is cool," **Sally** is the subject.
- **Predicate**: The part of a sentence or clause that tells what the subject does or is. It includes the verb and any objects, complements, or modifiers. Example: In "Sally is cool," **is cool** is the predicate.
- **Proposition**: A statement that expresses a relationship or condition, typically consisting of a subject and predicate. Examples include:
  - `x is cool`
  - `sally is x`
  - `x is y`
## Examples
### Prepositions
[Prepositions](#terms) don't require any variables. They are just general statements.
The keyword `not` is used before a [preposition](#terms) / [proposition](#terms).
```python
if sally is home then not sally is at work
```
### Propositions
The phrase `x is lame` is a [proposition](#terms). Once defined, `is lame` is now a [linking verb](#terms) that can be referenced in the future.
```python
if x is cool then not x is lame
```
You can invoke a [linking verb](#terms) with any [variable](#doc) you like and it will work the same.
```python
y is cool and not y is lame
```
If you spell the [linking verb](#terms) differently it will not mean the same thing. For example, `x is tallest` and `x is the tallest`. These will be treated as completely different statements about `x`.
### Using Multiple Variables
You can use multiple variables inside the same [preposition](#terms) to build complex relationships.
```python
if x is tallest then x is taller than y or y is x
```
### Equivalence Relations
When using [linking verbs](#terms) it is often important to specify which properties of an [equivalence relation](https://en.wikipedia.org/wiki/Equivalence_relation) it satisfies. If `~` is our [linking verb](#terms) then,
- Reflexive `a ~ a`
- Symmetric `a ~ b ⇒ b ~ a`
- Transitive `a ~ b ∧ b ~ c ⇒ a ~ c`

Here is how they are defined for `is`
```python
x is x                            # Reflexive
if x is y then y is x             # Symmetric
if x is y and y is z then x is z  # Transitive
```
## Final Notes
It can be easy to forget about things you may think are true in your head, but not explicitly stated in code. Make sure you identify all key relationships.<br>
### Bad Example
```python
if x is living then x is a plant or x is an animal
if not x is eating then x is a plant or not x is living
if x is a mammal and not x is eating then not x is living
```
### Good Example
```python
# Dont forget to state mutual exclusion!
if x is a mammal then not x is a plant
if x is living then x is a plant or x is an animal
if not x is eating then x is a plant or not x is living
if x is a mammal and not x is eating then not x is living
```
You can chain `xor` to do something similar.
```
x is a plant xor x is an animal xor x is an alien
```