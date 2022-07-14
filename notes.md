# notes

## absolute import 
to successfully import a module without `../` all around ( just in create-react project) .

```json
// jsconfig.json
{
  "compilerOptions": {
    "baseUrl": "src"
  },
  "include": ["src"]
}
```