/**
 * Set a permission node true/false for a given role
 *
 * @author Kay <kylrs00@gmail.com>
 * @license ISC - For more information, see the LICENSE.md file packaged with this file.
 * @since r20.1.0
 * @version v1.1.0
 */

const Command = require('../../../command/Command.js');
const { role:roleID, str, bool } = require('../../../command/arguments.js');

module.exports = class PermSetCommand extends Command {

    /**
     * PermSetCommand constructor
     *
     * @author Kay <kylrs00@gmail.com>
     * @since r20.1.0
     */
    constructor() {
        super(
            "permset",
            "Set a permission node for a role",
            "gagbot:permission:set", false,
            {
                "roleID": roleID,
                "node": str,
                "allow": bool,
            });
    }

    /**
     * Update the database guild document to reflect the request.
     *
     * @author Kay <kylrs00@gmail.com>
     * @since r20.1.0
     *
     * @param {Client} client
     * @param {Message} message
     * @param {ArgumentList} args
     * @returns {boolean}
     */
    async execute(client, message, args) {

        const guild = message.guild;
        const rid = args.get("roleID");

        if (guild.roles.fetch(rid) === null) {
            message.channel.send(`Invalid role ID \`${rid}\`.`);
            return false;
        }

        const node = args.get("node");

        if (!/(([a-z]+)|\*)(:(([a-z]+)|\*))*/i.test(node)) {
            message.channel.send(`Invalid permission node \`${node}\`.`);
            return false;
        }

        const allow = args.get("allow");

        const doc = await client.db.guild.findOne({id: guild.id});
        const roles = doc.permissions.roles;

        if (!roles.has(rid)) roles.set(rid, new Map());
        const perms = roles.get(rid);

        perms.set(node, allow);

        doc.markModified('permissions.roles');
        doc.save(function(err, doc) {
            if (err) {
                console.error(err);
                message.channel.send('A database error occurred :/');
                return;
            }

            message.channel.send('Permission set.');
        });

        return true;
    }
};