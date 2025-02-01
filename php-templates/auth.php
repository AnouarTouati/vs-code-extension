<?php


function getAbilitiesFromPolicyClasses()
{
    $modelsClasses = array_map(function ($filePath) {
        return 'App\\Models\\' . str_replace('.php', '', $filePath);
    }, scandir(__DIR__ . '/../../app/Models'));

    $policies = [];

    foreach ($modelsClasses as $modelClass) {
        try {
            $policyInstance = \Illuminate\Support\Facades\Gate::getPolicyFor($modelClass);
            $policyClass = get_class($policyInstance);
            $policies[$modelClass] = $policyClass;
        } catch (\Throwable $throwable) {
            //Do nothing
        }
    }

    return $policies;

}
echo collect(\Illuminate\Support\Facades\Gate::abilities())
    ->map(function ($policy, $key) {
        $reflection = new \ReflectionFunction($policy);
        $policyClass = null;
        $closureThis = $reflection->getClosureThis();

        if ($closureThis !== null) {
            if (get_class($closureThis) === \Illuminate\Auth\Access\Gate::class) {
                $vars = $reflection->getClosureUsedVariables();

                if (isset($vars['callback'])) {
                    [$policyClass, $method] = explode('@', $vars['callback']);

                    $reflection = new \ReflectionMethod($policyClass, $method);
                }
            }
        }

        return [
            'key' => $key,
            'uri' => $reflection->getFileName(),
            'policy_class' => $policyClass,
            'lineNumber' => $reflection->getStartLine(),
        ];
    })
    ->merge(
        collect(getAbilitiesFromPolicyClasses())->flatMap(function ($policyClass, $modelClass) {
            $methods = (new ReflectionClass($policyClass))->getMethods();

            return collect($methods)->map(function (ReflectionMethod $method) use ($policyClass,$modelClass) {
                return [
                    'key' => $method->getName(),
                    'uri' => $method->getFileName(),
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
