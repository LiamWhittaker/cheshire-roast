module.exports = {
  extends: "airbnb-base",


	"rules": {
		"no-unused-vars": [
			1,
			{
				"argsIgnorePattern": "res|next|^err"
			}
		],
		"arrow-body-style": [
			2,
			"as-needed"
		],
		"no-console": 0,
		"import/prefer-default-export": 0,
		"import": 0,
		"func-names": 0,
		"function-paren-newline": 0,
		"space-before-function-paren": 0,
		"comma-dangle": 0,
		"max-len": 0,
		"import/extensions": 0,
		"no-underscore-dangle": 0,
		"no-return-assign": 0,
		"no-undef": 0,
		"no-plusplus": 0,
		"no-param-reassign": 0,
		"consistent-return": 0,
		"quotes": [
			2,
			"single",
			{
				"avoidEscape": true,
				"allowTemplateLiterals": true
			}
		]
	}
}