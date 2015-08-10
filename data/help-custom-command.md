## AKP48 Custom Commands

Custom commands allow you to have AKP48 respond to custom phrases with short, pre-made messages.

## Command Usage
- `.command add <name> <message>`: Adds a command to this channel named `<name>`, which will return the message `<message>` when used. Can be used to edit existing commands.
- `.command create <name> <message>`: See `.command add <name> <message>`.
- `.command remove <name>`: Removes the command named `<name>` from this channel.
- `.command delete <name>`: See `.command remove <name>`.
- `.command help`: Brings you here.


## Advanced usage - Tokens

There are tokens that you can place in the message to dynamically include information in AKP48's responses.

- `[setByNick]` - The nick of the person who created the command.
- `[time]` - The current Linux epoch time, as seen by AKP48.
