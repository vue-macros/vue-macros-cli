# @vue-macros/cli

@vue-macros/cli is a CLI for rewriting at Vue Macros powered by [ast-grep](https://github.com/ast-grep/ast-grep).

## Installation
```shell
# install
pnpm add -g @vue-macros/cli
```

## Usage

### SG

Rewriting at Vue Macros.

```shell
vue-macros sg
```

supported macros:

- [x] jsx-directive
- [x] define-render
- [x] export-render
- [x] define-slots
- [x] short-vmodel
- [x] setup-sfc 

### Initialization

```shell
pnpm create vite my-vue-macros --template vue-ts
cd my-vue-macros
vue-macros init
```

## License

MIT License &copy; 2023-PRESENT [zhiyuanzmj](https://github.com/zhiyuanzmj)
