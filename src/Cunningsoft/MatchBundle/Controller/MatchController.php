<?php

namespace Cunningsoft\MatchBundle\Controller;

use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use SoccerSimulation\Simulation\Prm;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;

class MatchController extends Controller
{
    /**
     * @return array
     *
     * @Route("", name="match")
     * @Template
     */
    public function showAction()
    {
        return array(
            'fps' => Prm::FrameRate,
        );
    }
}
