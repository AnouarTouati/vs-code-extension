// This file was generated from php-templates/auth.php, do not edit directly
export default `
function getAbilitiesFromPolicyClasses()
{
    $modelsClasses = array_map(function ($filePath) {
        return 'App\\\\Models\\\\' . str_replace('.php', '', $filePath);
    }, scandir(__DIR__ . '/../../app/Models'));

    $policies = [];

    foreach ($modelsClasses as $modelClass) {
        try {
            $policyInstance = \\Illuminate\\Support\\Facades\\Gate::getPolicyFor($modelClass);
            $policyClass = get_class($policyInstance);
            $policies[$modelClass] = $policyClass;
        } catch (\\Throwable $throwable) {
            //Do nothing
        }
    }

    return $policies;

}
echo collect(\\Illuminate\\Support\\Facades\\Gate::abilities())
->map(function ($policy, $key) {

    $reflection = new \\ReflectionFunction($policy);

   //Class callback array
  if($reflection->getClosureScopeClass()->name === 'Illuminate\\Auth\\Access\\Gate'){

    $policyClass = null;
    $modelClass = null;
    $closureThis = $reflection->getClosureThis();

    if ($closureThis !== null) {
        if (get_class($closureThis) === \\Illuminate\\Auth\\Access\\Gate::class) {
            $vars = $reflection->getClosureUsedVariables();

            if (isset($vars['callback'])) {
                [$policyClass, $method] = explode('@', $vars['callback']);

                $reflection = new \\ReflectionMethod($policyClass, $method);
               
                if(count($reflection->getParameters())>=2){
                    $modelClass= $reflection->getParameters()[1]->getType()->__tostring();
                }
            }
        }
    }

    return [
        'key' => $key,
        'uri' => $reflection->getFileName(),
        'defined_by' => 'policy',
        'policy_class' => $policyClass,
        'model_class' => $modelClass,
        'lineNumber' => $reflection->getStartLine(),
    ];
     }
     //closure callback
    else if($reflection->getClosureScopeClass()->name ==='App\\Providers\\AppServiceProvider'){

        $modelClass = null;
        if(count($reflection->getParameters())>=2){
            $modelClass= $reflection->getParameters()[1]->getType()->__tostring();
        }

        return [
            'key' => $key,
            'uri' => $reflection->getFileName(),
            'defined_by' => 'gate',
            'policy_class' => null,
            'model_class' => $modelClass,
            'lineNumber' => $reflection->getStartLine(),
        ];
    }

})->merge(
        collect(getAbilitiesFromPolicyClasses())->flatMap(function ($policyClass, $modelClass) {
            $methods = (new ReflectionClass($policyClass))->getMethods();

            return collect($methods)->map(function (ReflectionMethod $method) use ($policyClass,$modelClass) {
                return [
                    'key' => $method->getName(),
                    'uri' => $method->getFileName(),
                    'defined_by' => 'policy',
                    'policy_class' => $policyClass,
                    'model_class' => $modelClass,
                    'lineNumber' => $method->getStartLine(),
                ];
            })->filter(function ($ability) {
                return !in_array($ability['key'], ['allow', 'deny']);
            });
        }),
    )
    ->values()
    ->groupBy('key')
    ->toJson();
`;